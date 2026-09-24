// Bulk-create or update the preset list of participant Study IDs + passwords
// from an Excel file, instead of typing them into an array.
//
// Usage:
//   1. Make sure .env has VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set.
//   2. Run:  node scripts/manage-participants.mjs
//      The first run creates scripts/participants.xlsx (with headers +
//      example rows) if it doesn't exist yet, then stops so you can fill it in.
//   3. Fill in "Study ID" and "Password" columns for every participant, then
//      run the same command again to create/update their logins.
//   Optional: node scripts/manage-participants.mjs path/to/other-file.xlsx
//
// Each participant gets a Supabase Auth user with a synthetic email
// (<studyid>@participants.recoveryisland.local) and the password from the
// spreadsheet. Existing participants (matched by Study ID) get their
// password updated in place rather than being duplicated. This script
// requires the service_role key, so only ever run it locally/on a trusted
// machine — never ship SUPABASE_SERVICE_ROLE_KEY or participants.xlsx to
// the browser or to source control.

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import ExcelJS from 'exceljs'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join, resolve } from 'path'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))
const STUDY_ID_DOMAIN = 'participants.recoveryisland.local'
const filePath = process.argv[2] ? resolve(process.argv[2]) : join(__dirname, 'participants.xlsx')

function studyIdToEmail(studyId) {
  const slug = String(studyId).trim().toLowerCase().replace(/[^a-z0-9._-]/g, '')
  return `${slug}@${STUDY_ID_DOMAIN}`
}

async function createTemplate() {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Participants')
  sheet.columns = [
    { header: 'Study ID', key: 'studyId', width: 18 },
    { header: 'Password', key: 'password', width: 24 },
  ]
  sheet.getRow(1).font = { bold: true }
  sheet.addRow({ studyId: 'P001', password: 'change-me-1' })
  sheet.addRow({ studyId: 'P002', password: 'change-me-2' })
  await workbook.xlsx.writeFile(filePath)
}

// A plain typed cell's .value is a string/number. A formula cell's .value is
// an object ({ formula, result, ... }) even after Excel has evaluated it —
// e.g. a dynamic array like ="P"&TEXT(SEQUENCE(100),"000") spilled down a
// column. String(cell.value) on that object silently produces the literal
// text "[object Object]" instead of the formula's result, so unwrap it here.
function cellText(cell) {
  const value = cell.value
  if (value && typeof value === 'object' && 'result' in value) {
    return String(value.result ?? '').trim()
  }
  return String(value || '').trim()
}

async function readParticipants() {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(filePath)
  const sheet = workbook.worksheets[0]

  const participants = []
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return // header row
    const studyId = cellText(row.getCell(1))
    const password = cellText(row.getCell(2))
    if (studyId && password) participants.push({ studyId, password })
  })
  return participants
}

async function main() {
  if (!existsSync(filePath)) {
    await createTemplate()
    console.log(`Created ${filePath}`)
    console.log('Fill in the Study ID and Password columns, then run this command again.')
    return
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
    process.exit(1)
  }

  const participants = await readParticipants()
  if (participants.length === 0) {
    console.error(`No participant rows found in ${filePath}. Add rows below the header and run this again.`)
    process.exit(1)
  }

  const admin = createClient(supabaseUrl, serviceRoleKey)

  // listUsers is paginated; 1000 per page comfortably covers most studies.
  const { data: existingUsers, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (listError) {
    console.error('Could not list existing users:', listError.message)
    process.exit(1)
  }

  for (const { studyId, password } of participants) {
    const email = studyIdToEmail(studyId)
    const existing = existingUsers.users.find(u => u.email === email)

    try {
      if (existing) {
        const { error } = await admin.auth.admin.updateUserById(existing.id, { password })
        if (error) throw error
        console.log(`Updated password for ${studyId}`)
      } else {
        const { error } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { study_id: studyId.toUpperCase() },
        })
        if (error) throw error
        console.log(`Created participant ${studyId}`)
      }
    } catch (err) {
      console.error(`Failed for ${studyId}:`, err.message)
    }
  }

  console.log('Done.')
}

main()


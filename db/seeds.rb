# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Create a default dev user
user = User.find_or_create_by!(email_address: "dev@example.com") do |u|
  u.password = "password123456"
  u.password_confirmation = "password123456"
end

today_date = Date.today.to_s

# Job application data exported from job-applications-dump.csv
applications = [
  { company: "Company - Applied", position: "Software Engineer", link: "https://www.example.com/careers/position/abc123", status: "applied", applied_on: today_date, notes: "This is a test of markdown formatting
- `Code`
- **Bold**
- **Italic**
" },
  { company: "Company - Interviewing", position: "Software Engineer", link: "https://www.example.com/careers/position/abc123", status: "interviewing", applied_on: today_date, notes: "TODO" },
  { company: "Company - Offered", position: "Software Engineer", link: "https://www.example.com/careers/position/abc123", status: "offered", applied_on: today_date, notes: "TODO" },
  { company: "Company - Accepted", position: "Software Engineer", link: "https://www.example.com/careers/position/abc123", status: "accepted", applied_on: today_date, notes: "TODO" },
  { company: "Company - Rejected", position: "Software Engineer", link: "https://www.example.com/careers/position/abc123", status: "rejected", applied_on: today_date, notes: "TODO" },
  { company: "Company - Ghosted", position: "Software Engineer", link: "https://www.example.com/careers/position/abc123", status: "ghosted", applied_on: today_date, notes: "TODO" },
  { company: "Company - Withdrawn", position: "Software Engineer", link: "https://www.example.com/careers/position/abc123", status: "withdrawn", applied_on: today_date, notes: "TODO" }
]

applications.each do |attrs|
  user.job_applications.find_or_create_by!(
    company: attrs[:company],
    position: attrs[:position]
  ) do |app|
    app.link       = attrs[:link]
    app.status     = attrs[:status]
    app.notes      = attrs[:notes]
    app.applied_on = attrs[:applied_on]
  end
end

puts "Seeded #{user.job_applications.count} job applications for #{user.email_address}"

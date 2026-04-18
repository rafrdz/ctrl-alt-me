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

# Sample activities for each job application
sample_activities = {
  "applied" => [
    { event_type: "note", description: "Submitted application through company careers page.", days_ago: 0 }
  ],
  "interviewing" => [
    { event_type: "note", description: "Submitted application through company careers page.", days_ago: 14 },
    { event_type: "phone_screen", description: "30-minute call with recruiter. Discussed role expectations and team culture.", days_ago: 10 },
    { event_type: "technical_interview", description: "1-hour live coding session. Focused on data structures and system design.", days_ago: 5 },
    { event_type: "take_home", description: "Received take-home assignment. Build a small REST API — due in 3 days.", days_ago: 3 }
  ],
  "offered" => [
    { event_type: "note", description: "Submitted application through company careers page.", days_ago: 30 },
    { event_type: "phone_screen", description: "Initial screen with hiring manager.", days_ago: 25 },
    { event_type: "technical_interview", description: "Panel interview with 3 engineers. Went well overall.", days_ago: 18 },
    { event_type: "onsite", description: "Full-day onsite — met the team, whiteboard session, and culture fit chat.", days_ago: 10 },
    { event_type: "offer_received", description: "Received offer! Base + equity package. Need to respond within a week.", days_ago: 2 }
  ],
  "accepted" => [
    { event_type: "note", description: "Submitted application through company careers page.", days_ago: 45 },
    { event_type: "phone_screen", description: "Quick intro call with recruiter.", days_ago: 40 },
    { event_type: "technical_interview", description: "Two rounds of technical interviews.", days_ago: 30 },
    { event_type: "onsite", description: "Onsite day — really liked the team and office.", days_ago: 20 },
    { event_type: "offer_received", description: "Offer received. Negotiated salary and start date.", days_ago: 10 },
    { event_type: "note", description: "Accepted the offer! Start date confirmed.", days_ago: 5 }
  ],
  "rejected" => [
    { event_type: "note", description: "Submitted application through company careers page.", days_ago: 21 },
    { event_type: "phone_screen", description: "Phone screen with recruiter.", days_ago: 14 },
    { event_type: "technical_interview", description: "Technical interview — struggled with the system design portion.", days_ago: 7 },
    { event_type: "note", description: "Received rejection email. They went with another candidate.", days_ago: 3 }
  ],
  "ghosted" => [
    { event_type: "note", description: "Submitted application through company careers page.", days_ago: 30 },
    { event_type: "follow_up", description: "Sent follow-up email to recruiter. No response yet.", days_ago: 14 },
    { event_type: "follow_up", description: "Second follow-up — still no response.", days_ago: 7 }
  ],
  "withdrawn" => [
    { event_type: "note", description: "Submitted application through company careers page.", days_ago: 20 },
    { event_type: "phone_screen", description: "Phone screen with recruiter. Role doesn't align with what I'm looking for.", days_ago: 14 },
    { event_type: "note", description: "Withdrew application — accepted another offer.", days_ago: 5 }
  ]
}

user.job_applications.each do |app|
  next if app.activities.any?

  activities = sample_activities[app.status] || []
  activities.each do |act|
    app.activities.create!(
      event_type: act[:event_type],
      description: act[:description],
      occurred_on: Date.today - act[:days_ago]
    )
  end
end

puts "Seeded #{Activity.count} activities across all job applications"

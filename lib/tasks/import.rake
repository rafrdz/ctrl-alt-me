require "csv"

namespace :import do
  desc "Import job applications from a csv file. The file should have the following columns: company, position, link, status, notes, created_at"
  task csv: :environment do
    file = Rails.root.join("job-applications-dump.csv")
    abort "File not found: #{file}" unless File.exist?(file)

    user = User.find_or_create_by!(email_address: "dev@example.com") do |u|
      u.password = "password123456"
      u.password_confirmation = "password123456"
    end

    imported = 0
    skipped = 0

    CSV.foreach(file, headers: true, liberal_parsing: true) do |row|
      app = user.job_applications.find_or_initialize_by(
        company: row["company"],
        position: row["position"]
      )

      if app.persisted?
        skipped += 1
        next
      end

      app.link = row["link"].presence || ""
      app.status = row["status"]
      app.notes = row["notes"].presence
      app.applied_on = Date.parse(row["created_at"])

      if app.save
        imported += 1
      else
        puts "  FAILED: #{row['company']} - #{row['position']}: #{app.errors.full_messages.join(', ')}"
      end
    end

    puts "Done. Imported: #{imported}, Skipped (already existed): #{skipped}"
  end
end

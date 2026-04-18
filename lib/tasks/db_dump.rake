require "json"

namespace :db do
  DUMP_FILE = "db_dump.json"

  desc "Dump job applications and activities to a JSON file (#{DUMP_FILE})"
  task dump: :environment do
    data = {
      exported_at: Time.current.iso8601,
      users: User.all.map { |u|
        {
          email_address: u.email_address,
          created_at: u.created_at.iso8601,
          job_applications: u.job_applications.includes(:activities).map { |ja|
            {
              company: ja.company,
              position: ja.position,
              link: ja.link,
              status: ja.status,
              notes: ja.notes,
              applied_on: ja.applied_on&.iso8601,
              created_at: ja.created_at.iso8601,
              updated_at: ja.updated_at.iso8601,
              activities: ja.activities.map { |a|
                {
                  event_type: a.event_type,
                  description: a.description,
                  occurred_on: a.occurred_on.iso8601,
                  created_at: a.created_at.iso8601,
                  updated_at: a.updated_at.iso8601
                }
              }
            }
          }
        }
      }
    }

    file = Rails.root.join(DUMP_FILE)
    File.write(file, JSON.pretty_generate(data))
    puts "Dumped #{JobApplication.count} job applications and #{Activity.count} activities to #{file}"
  end

  desc "Load job applications and activities from a JSON dump file (#{DUMP_FILE})"
  task load_dump: :environment do
    file = Rails.root.join(DUMP_FILE)
    abort "File not found: #{file}" unless File.exist?(file)

    data = JSON.parse(File.read(file))
    imported_apps = 0
    imported_activities = 0
    skipped = 0

    ActiveRecord::Base.transaction do
      data["users"].each do |user_data|
        user = User.find_or_create_by!(email_address: user_data["email_address"]) do |u|
          u.password = "password123456"
          u.password_confirmation = "password123456"
        end

        user_data["job_applications"].each do |ja_data|
          app = user.job_applications.find_or_initialize_by(
            company: ja_data["company"],
            position: ja_data["position"]
          )

          if app.persisted?
            skipped += 1
            next
          end

          app.assign_attributes(
            link: ja_data["link"],
            status: ja_data["status"],
            notes: ja_data["notes"],
            applied_on: ja_data["applied_on"]
          )

          unless app.save
            puts "  FAILED: #{ja_data['company']} - #{ja_data['position']}: #{app.errors.full_messages.join(', ')}"
            next
          end

          imported_apps += 1

          ja_data["activities"]&.each do |act_data|
            activity = app.activities.create!(
              event_type: act_data["event_type"],
              description: act_data["description"],
              occurred_on: act_data["occurred_on"]
            )
            imported_activities += 1
          end
        end
      end
    end

    puts "Done. Imported: #{imported_apps} job applications, #{imported_activities} activities. Skipped: #{skipped}"
  end
end

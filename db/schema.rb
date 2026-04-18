# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_04_18_024345) do
  create_table "activities", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.string "event_type", null: false
    t.integer "job_application_id", null: false
    t.date "occurred_on", null: false
    t.datetime "updated_at", null: false
    t.index ["job_application_id"], name: "index_activities_on_job_application_id"
  end

  create_table "job_applications", force: :cascade do |t|
    t.date "applied_on"
    t.string "company"
    t.datetime "created_at", null: false
    t.string "link"
    t.text "notes"
    t.string "position"
    t.string "status"
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["user_id"], name: "index_job_applications_on_user_id"
  end

  create_table "sessions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "ip_address"
    t.datetime "updated_at", null: false
    t.string "user_agent"
    t.integer "user_id", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email_address", null: false
    t.string "password_digest", null: false
    t.datetime "updated_at", null: false
    t.index ["email_address"], name: "index_users_on_email_address", unique: true
  end

  add_foreign_key "activities", "job_applications"
  add_foreign_key "job_applications", "users"
  add_foreign_key "sessions", "users"
end

class Activity < ApplicationRecord
  belongs_to :job_application

  enum :event_type, {
    note:                "note",
    phone_screen:        "phone_screen",
    technical_interview: "technical_interview",
    onsite:              "onsite",
    take_home:           "take_home",
    offer_received:      "offer_received",
    follow_up:           "follow_up",
    other:               "other"
  }

  validates :event_type, :occurred_on, presence: true

  scope :chronological, -> { order(occurred_on: :desc, created_at: :desc) }
end

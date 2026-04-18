class JobApplication < ApplicationRecord
  belongs_to :user
  has_many :activities, dependent: :destroy

  enum :status, {
    applied:      "applied",
    interviewing: "interviewing",
    offered:      "offered",
    accepted:     "accepted",
    rejected:     "rejected",
    ghosted:      "ghosted",
    withdrawn:    "withdrawn"
  }

  validates :company, :position, :status, presence: true
  validates :link, format: { with: URI::DEFAULT_PARSER.make_regexp(%w[http https]) }, allow_blank: true

  scope :active, -> { where(status: %w[applied interviewing offered]) }
  scope :recent, -> { order(applied_on: :desc, created_at: :desc) }
  scope :search, ->(query) { where("company LIKE :q OR position LIKE :q", q: "%#{sanitize_sql_like(query)}%") }
end

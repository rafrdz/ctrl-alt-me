require "commonmarker"

module ApplicationHelper
  MARKDOWN_SAFE_TAGS = %w[p ul ol li strong em a blockquote code pre h1 h2 h3 h4 br].freeze
  MARKDOWN_SAFE_ATTRS = %w[href].freeze

  def render_markdown(text)
    return "" if text.blank?
    html = Commonmarker.to_html(text)
    sanitize(html, tags: MARKDOWN_SAFE_TAGS, attributes: MARKDOWN_SAFE_ATTRS)
  end

  STATUS_COLORS = {
    "applied"      => "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    "interviewing" => "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    "offered"      => "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    "accepted"     => "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    "rejected"     => "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    "ghosted"      => "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
    "withdrawn"    => "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
  }.freeze

  def status_badge(status)
    classes = STATUS_COLORS.fetch(status.to_s, "bg-gray-100 text-gray-600")
    content_tag(:span, status.to_s.capitalize, class: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium #{classes}")
  end

  EVENT_TYPE_LABELS = {
    "note"                => "Note",
    "phone_screen"        => "Phone screen",
    "technical_interview" => "Technical interview",
    "onsite"              => "Onsite",
    "take_home"           => "Take-home",
    "offer_received"      => "Offer received",
    "follow_up"           => "Follow-up",
    "other"               => "Other"
  }.freeze

  def event_type_label(event_type)
    EVENT_TYPE_LABELS.fetch(event_type.to_s, event_type.to_s.humanize)
  end
end

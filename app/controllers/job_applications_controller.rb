class JobApplicationsController < ApplicationController
  before_action :set_job_application, only: %i[show edit update destroy]

  def index
    base = current_user.job_applications
    @search = params[:search].presence
    base = base.search(@search) if @search

    @stats = base.group(:status).count
    @total = @stats.values.sum
    @status_filter = params[:status].presence

    if @status_filter && JobApplication.statuses.key?(@status_filter)
      @filtered = base.where(status: @status_filter).recent
    else
      @status_filter = nil
      @active = base.active.recent
      @archived = base.where(status: %w[accepted rejected ghosted withdrawn]).recent
    end

    respond_to do |format|
      format.html
      format.csv do
        applications = base.includes(:activities).recent
        csv_data = generate_csv(applications)
        send_data csv_data, filename: "job-applications-#{Date.today}.csv", type: :csv
      end
    end
  end

  def show
  end

  def new
    @job_application = current_user.job_applications.build(applied_on: Date.today)
  end

  def create
    @job_application = current_user.job_applications.build(job_application_params)

    if @job_application.save
      redirect_to @job_application, notice: "Application added."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @job_application.update(job_application_params)
      redirect_to @job_application, notice: "Application updated."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @job_application.destroy
    redirect_to job_applications_path, notice: "Application removed.", status: :see_other
  end

  private

  def set_job_application
    @job_application = current_user.job_applications.find(params[:id])
  end

  def current_user
    Current.user
  end

  def job_application_params
    params.expect(job_application: [ :company, :position, :link, :status, :notes, :applied_on ])
  end

  def generate_csv(applications)
    require "csv"
    CSV.generate do |csv|
      csv << %w[Company Position Status Applied\ On Link Notes Activities]
      applications.each do |app|
        activities_summary = app.activities.chronological.map { |a|
          "#{a.event_type} (#{a.occurred_on})"
        }.join("; ")
        csv << [ app.company, app.position, app.status, app.applied_on, app.link, app.notes, activities_summary ]
      end
    end
  end
end

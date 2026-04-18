class ActivitiesController < ApplicationController
  before_action :set_job_application

  def create
    @activity = @job_application.activities.build(activity_params)

    if @activity.save
      redirect_to @job_application, notice: "Activity added."
    else
      redirect_to @job_application, alert: "Could not add activity: #{@activity.errors.full_messages.join(', ')}"
    end
  end

  def destroy
    @activity = @job_application.activities.find(params[:id])
    @activity.destroy
    redirect_to @job_application, notice: "Activity removed.", status: :see_other
  end

  private

  def set_job_application
    @job_application = Current.user.job_applications.find(params[:job_application_id])
  end

  def activity_params
    params.expect(activity: [ :event_type, :description, :occurred_on ])
  end
end

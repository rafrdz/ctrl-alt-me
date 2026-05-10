require "test_helper"

class JobApplicationsControllerImportTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    sign_in_as(@user)
  end

  test "import creates new job applications from CSV" do
    csv = <<~CSV
      Company,Position,Status,Applied On,Link,Notes,Activities
      Acme Inc,Developer,applied,2026-01-15,https://acme.com/jobs,Great opportunity,
      Globex,Designer,interviewing,2026-02-20,,Some notes,
    CSV

    file = Rack::Test::UploadedFile.new(
      StringIO.new(csv), "text/csv", original_filename: "import.csv"
    )

    assert_difference "JobApplication.count", 2 do
      post import_job_applications_path, params: { file: file }
    end

    assert_redirected_to job_applications_path
    assert_match "2 added", flash[:notice]

    app = @user.job_applications.find_by(company: "Acme Inc", position: "Developer")
    assert_equal "applied", app.status
    assert_equal "https://acme.com/jobs", app.link
    assert_equal "Great opportunity", app.notes
    assert_equal Date.new(2026, 1, 15), app.applied_on
  end

  test "import skips existing job applications" do
    @user.job_applications.create!(
      company: "Acme Inc", position: "Developer", status: "applied", applied_on: Date.today
    )

    csv = <<~CSV
      Company,Position,Status,Applied On,Link,Notes,Activities
      Acme Inc,Developer,applied,2026-01-15,https://acme.com/jobs,,
    CSV

    file = Rack::Test::UploadedFile.new(
      StringIO.new(csv), "text/csv", original_filename: "import.csv"
    )

    assert_no_difference "JobApplication.count" do
      post import_job_applications_path, params: { file: file }
    end

    assert_match "1 already existed", flash[:notice]
  end

  test "import rejects non-CSV file" do
    file = Rack::Test::UploadedFile.new(
      StringIO.new("not a csv"), "text/plain", original_filename: "import.txt"
    )

    assert_no_difference "JobApplication.count" do
      post import_job_applications_path, params: { file: file }
    end

    assert_redirected_to job_applications_path
    assert_equal "Please upload a valid CSV file.", flash[:alert]
  end

  test "import rejects missing file" do
    post import_job_applications_path

    assert_redirected_to job_applications_path
    assert_equal "Please upload a valid CSV file.", flash[:alert]
  end
end

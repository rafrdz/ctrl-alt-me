class CreateJobApplications < ActiveRecord::Migration[8.1]
  def change
    create_table :job_applications do |t|
      t.references :user, null: false, foreign_key: true
      t.string :company
      t.string :position
      t.string :link
      t.string :status
      t.text :notes
      t.date :applied_on

      t.timestamps
    end
  end
end

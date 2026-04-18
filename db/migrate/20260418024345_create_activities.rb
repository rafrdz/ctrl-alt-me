class CreateActivities < ActiveRecord::Migration[8.1]
  def change
    create_table :activities do |t|
      t.references :job_application, null: false, foreign_key: true
      t.string :event_type, null: false
      t.text :description
      t.date :occurred_on, null: false

      t.timestamps
    end
  end
end

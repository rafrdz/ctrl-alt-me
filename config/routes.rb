Rails.application.routes.draw do
  resource :session
  resources :passwords, param: :token
  resource :registration, only: %i[new create]

  resources :job_applications do
    resources :activities, only: %i[create destroy]
  end

  root "job_applications#index"

  get "up" => "rails/health#show", as: :rails_health_check
end

(ns bunsen.marketplace.component.server
  (:require [ring.adapter.jetty :refer [run-jetty]]
            [com.stuartsierra.component :as component :refer [start stop]]
            [ring.middleware.json :refer [wrap-json-body]]
            [ring.middleware.cookies :refer [wrap-cookies]]
            [ring.middleware.session :refer [wrap-session]]
            [ring.middleware.params :refer [wrap-params]]
            [ring.middleware.stacktrace :refer [wrap-stacktrace-log]]
            [ring.middleware.keyword-params :refer [wrap-keyword-params]]
            [ring.util.response :refer [response]]
            [bidi.ring :refer (make-handler)]
            [bunsen.common.middleware.logger :refer [wrap-logger]]
            [bunsen.common.middleware.database :refer [wrap-database wrap-database-reconnect]]
            [bunsen.marketplace.helper.elasticsearch :refer [wrap-elasticsearch]]
            [bunsen.common.helper.session.store :refer [bunsen-cookie-store]]
            [bunsen.marketplace.resource :as resource]
            [bunsen.marketplace.route :as route]
            [bunsen.common.helper.kerberos :as kerberos]))

(def resources
  {:status resource/status
   :categories resource/categories
   :seed-datasets resource/seed-datasets
   :seed-subscriptions resource/seed-subscriptions
   :subscription resource/subscription
   :subscriptions resource/subscriptions
   :dataset resource/dataset
   :datasets resource/datasets
   :average-rating resource/average-rating
   :rating resource/rating
   :refresh-index resource/refresh-index
   :indices resource/indices
   :mappings resource/mappings
   :formats resource/formats
   :tags resource/tags
   :vendors resource/vendors
   :default resource/default})

(defn conditionally-wrap-database [handler config database]
  (if (= "true" (:allow-seed config))
    (wrap-database-reconnect handler config)
    (wrap-database handler database)))

(defn wrap-config [handler config]
  (fn [req]
    (handler (assoc req :config config))))

(defrecord Server [config database elasticsearch]
  component/Lifecycle
  (start [server]
    (if (:jetty server)
      server
      (let [principal (if (:use-kerberos config) (:kerberos-principal config) nil)
            handler (make-handler
                      route/routes
                      #(let [resource (% resources)]
                         (fn [request]
                           ((resource (:params request)) request))))]

        (assoc server
               :jetty (run-jetty (-> handler
                                     (wrap-session {:store (bunsen-cookie-store (:cookie-salt config))
                                                    :cookie-name "session"})
                                     wrap-logger
                                     wrap-cookies
                                     wrap-keyword-params
                                     wrap-params
                                     (conditionally-wrap-database config database)
                                     (wrap-config config)
                                     (wrap-elasticsearch elasticsearch)
                                     wrap-stacktrace-log
                                     (wrap-json-body {:keywords? true})
                                     (kerberos/authenticate principal))
                                 (:jetty-options config))))))

  (stop [server]
    (when-let [jetty (:jetty server)]
      (.stop jetty))
    (dissoc server :jetty)))

(defn server [config] (map->Server {:config config}))

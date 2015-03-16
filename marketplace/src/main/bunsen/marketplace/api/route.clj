(ns bunsen.marketplace.api.route)

(def routes
  ["/api/v1" {"/status" :status
              "/categories" :categories
              "/datasets" :datasets
              "/refresh" :refresh
              "/counts" :counts
              "/indices" :indices
              "/mappings" :mappings
              }])
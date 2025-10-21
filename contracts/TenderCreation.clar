(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-INVALID-DESCRIPTION u101)
(define-constant ERR-INVALID-DEADLINE u102)
(define-constant ERR-INVALID-CRITERIA u103)
(define-constant ERR-INVALID-BUDGET u104)
(define-constant ERR-INVALID-ELIGIBILITY u105)
(define-constant ERR-TENDER-ALREADY-EXISTS u106)
(define-constant ERR-TENDER-NOT-FOUND u107)
(define-constant ERR-INVALID-TIMESTAMP u108)
(define-constant ERR-AGENCY-NOT-VERIFIED u109)
(define-constant ERR-INVALID-MIN-BID u110)
(define-constant ERR-INVALID-MAX-BID u111)
(define-constant ERR-TENDER-UPDATE-NOT-ALLOWED u112)
(define-constant ERR-INVALID-UPDATE-PARAM u113)
(define-constant ERR-MAX-TENDERS_EXCEEDED u114)
(define-constant ERR-INVALID-TENDER-TYPE u115)
(define-constant ERR-INVALID-EVALUATION_METHOD u116)
(define-constant ERR-INVALID-CONTRACT_DURATION u117)
(define-constant ERR-INVALID-LOCATION u118)
(define-constant ERR-INVALID-CURRENCY u119)
(define-constant ERR-INVALID-STATUS u120)
(define-constant ERR-INVALID-START-DATE u121)
(define-constant ERR-INVALID-END-DATE u122)
(define-constant ERR-INVALID-AWARD-CRITERIA u123)
(define-constant ERR-INVALID-PAYMENT_TERMS u124)
(define-constant ERR-INVALID-DELIVERY_TERMS u125)

(define-data-var next-tender-id uint u0)
(define-data-var max-tenders uint u10000)
(define-data-var creation-fee uint u5000)
(define-data-var agency-registry-contract (optional principal) none)

(define-map tenders
  uint
  {
    description: (string-utf8 500),
    submission-deadline: uint,
    evaluation-criteria: (string-utf8 300),
    budget: uint,
    eligibility-requirements: (string-utf8 300),
    timestamp: uint,
    creator: principal,
    tender-type: (string-utf8 50),
    evaluation-method: (string-utf8 50),
    contract-duration: uint,
    location: (string-utf8 100),
    currency: (string-utf8 20),
    status: bool,
    min-bid: uint,
    max-bid: uint,
    start-date: uint,
    end-date: uint,
    award-criteria: (string-utf8 200),
    payment-terms: (string-utf8 200),
    delivery-terms: (string-utf8 200)
  }
)

(define-map tenders-by-description
  (string-utf8 500)
  uint)

(define-map tender-updates
  uint
  {
    update-description: (string-utf8 500),
    update-submission-deadline: uint,
    update-budget: uint,
    update-timestamp: uint,
    updater: principal
  }
)

(define-read-only (get-tender (id uint))
  (map-get? tenders id)
)

(define-read-only (get-tender-updates (id uint))
  (map-get? tender-updates id)
)

(define-read-only (is-tender-registered (description (string-utf8 500)))
  (is-some (map-get? tenders-by-description description))
)

(define-private (validate-description (desc (string-utf8 500)))
  (if (and (> (len desc) u0) (<= (len desc) u500))
      (ok true)
      (err ERR-INVALID-DESCRIPTION))
)

(define-private (validate-deadline (deadline uint))
  (if (> deadline block-height)
      (ok true)
      (err ERR-INVALID-DEADLINE))
)

(define-private (validate-criteria (criteria (string-utf8 300)))
  (if (and (> (len criteria) u0) (<= (len criteria) u300))
      (ok true)
      (err ERR-INVALID-CRITERIA))
)

(define-private (validate-budget (budget uint))
  (if (> budget u0)
      (ok true)
      (err ERR-INVALID-BUDGET))
)

(define-private (validate-eligibility (eligibility (string-utf8 300)))
  (if (and (> (len eligibility) u0) (<= (len eligibility) u300))
      (ok true)
      (err ERR-INVALID-ELIGIBILITY))
)

(define-private (validate-timestamp (ts uint))
  (if (>= ts block-height)
      (ok true)
      (err ERR-INVALID-TIMESTAMP))
)

(define-private (validate-tender-type (type (string-utf8 50)))
  (if (or (is-eq type "open") (is-eq type "restricted") (is-eq type "negotiated"))
      (ok true)
      (err ERR-INVALID-TENDER-TYPE))
)

(define-private (validate-evaluation-method (method (string-utf8 50)))
  (if (or (is-eq method "lowest-price") (is-eq method "best-value") (is-eq method "scored"))
      (ok true)
      (err ERR-INVALID-EVALUATION_METHOD))
)

(define-private (validate-contract-duration (duration uint))
  (if (> duration u0)
      (ok true)
      (err ERR-INVALID-CONTRACT_DURATION))
)

(define-private (validate-location (loc (string-utf8 100)))
  (if (and (> (len loc) u0) (<= (len loc) u100))
      (ok true)
      (err ERR-INVALID-LOCATION))
)

(define-private (validate-currency (cur (string-utf8 20)))
  (if (or (is-eq cur "STX") (is-eq cur "USD") (is-eq cur "BTC"))
      (ok true)
      (err ERR-INVALID-CURRENCY))
)

(define-private (validate-min-bid (min uint))
  (if (> min u0)
      (ok true)
      (err ERR-INVALID-MIN-BID))
)

(define-private (validate-max-bid (max uint))
  (if (> max u0)
      (ok true)
      (err ERR-INVALID-MAX-BID))
)

(define-private (validate-start-date (start uint))
  (if (>= start block-height)
      (ok true)
      (err ERR-INVALID-START-DATE))
)

(define-private (validate-end-date (end uint) (start uint))
  (if (> end start)
      (ok true)
      (err ERR-INVALID-END-DATE))
)

(define-private (validate-award-criteria (criteria (string-utf8 200)))
  (if (and (> (len criteria) u0) (<= (len criteria) u200))
      (ok true)
      (err ERR-INVALID-AWARD-CRITERIA))
)

(define-private (validate-payment-terms (terms (string-utf8 200)))
  (if (and (> (len terms) u0) (<= (len terms) u200))
      (ok true)
      (err ERR-INVALID-PAYMENT_TERMS))
)

(define-private (validate-delivery-terms (terms (string-utf8 200)))
  (if (and (> (len terms) u0) (<= (len terms) u200))
      (ok true)
      (err ERR-INVALID-DELIVERY_TERMS))
)

(define-private (validate-principal (p principal))
  (if (not (is-eq p 'SP000000000000000000002Q6VF78))
      (ok true)
      (err ERR-NOT-AUTHORIZED))
)

(define-public (set-agency-registry-contract (contract-principal principal))
  (begin
    (try! (validate-principal contract-principal))
    (asserts! (is-none (var-get agency-registry-contract)) (err ERR-AGENCY-NOT-VERIFIED))
    (var-set agency-registry-contract (some contract-principal))
    (ok true)
  )
)

(define-public (set-max-tenders (new-max uint))
  (begin
    (asserts! (> new-max u0) (err ERR-MAX-TENDERS_EXCEEDED))
    (asserts! (is-some (var-get agency-registry-contract)) (err ERR-AGENCY-NOT-VERIFIED))
    (var-set max-tenders new-max)
    (ok true)
  )
)

(define-public (set-creation-fee (new-fee uint))
  (begin
    (asserts! (>= new-fee u0) (err ERR-INVALID-UPDATE-PARAM))
    (asserts! (is-some (var-get agency-registry-contract)) (err ERR-AGENCY-NOT-VERIFIED))
    (var-set creation-fee new-fee)
    (ok true)
  )
)

(define-public (create-tender
  (description (string-utf8 500))
  (submission-deadline uint)
  (evaluation-criteria (string-utf8 300))
  (budget uint)
  (eligibility-requirements (string-utf8 300))
  (tender-type (string-utf8 50))
  (evaluation-method (string-utf8 50))
  (contract-duration uint)
  (location (string-utf8 100))
  (currency (string-utf8 20))
  (min-bid uint)
  (max-bid uint)
  (start-date uint)
  (end-date uint)
  (award-criteria (string-utf8 200))
  (payment-terms (string-utf8 200))
  (delivery-terms (string-utf8 200))
)
  (let (
        (next-id (var-get next-tender-id))
        (current-max (var-get max-tenders))
        (agency (var-get agency-registry-contract))
      )
    (asserts! (< next-id current-max) (err ERR-MAX-TENDERS_EXCEEDED))
    (try! (validate-description description))
    (try! (validate-deadline submission-deadline))
    (try! (validate-criteria evaluation-criteria))
    (try! (validate-budget budget))
    (try! (validate-eligibility eligibility-requirements))
    (try! (validate-tender-type tender-type))
    (try! (validate-evaluation-method evaluation-method))
    (try! (validate-contract-duration contract-duration))
    (try! (validate-location location))
    (try! (validate-currency currency))
    (try! (validate-min-bid min-bid))
    (try! (validate-max-bid max-bid))
    (try! (validate-start-date start-date))
    (try! (validate-end-date end-date start-date))
    (try! (validate-award-criteria award-criteria))
    (try! (validate-payment-terms payment-terms))
    (try! (validate-delivery-terms delivery-terms))
    (asserts! (is-none (map-get? tenders-by-description description)) (err ERR-TENDER-ALREADY-EXISTS))
    (let ((agency-recipient (unwrap! agency (err ERR-AGENCY-NOT-VERIFIED))))
      (try! (stx-transfer? (var-get creation-fee) tx-sender agency-recipient))
    )
    (map-set tenders next-id
      {
        description: description,
        submission-deadline: submission-deadline,
        evaluation-criteria: evaluation-criteria,
        budget: budget,
        eligibility-requirements: eligibility-requirements,
        timestamp: block-height,
        creator: tx-sender,
        tender-type: tender-type,
        evaluation-method: evaluation-method,
        contract-duration: contract-duration,
        location: location,
        currency: currency,
        status: true,
        min-bid: min-bid,
        max-bid: max-bid,
        start-date: start-date,
        end-date: end-date,
        award-criteria: award-criteria,
        payment-terms: payment-terms,
        delivery-terms: delivery-terms
      }
    )
    (map-set tenders-by-description description next-id)
    (var-set next-tender-id (+ next-id u1))
    (print { event: "tender-created", id: next-id })
    (ok next-id)
  )
)

(define-public (update-tender
  (tender-id uint)
  (update-description (string-utf8 500))
  (update-submission-deadline uint)
  (update-budget uint)
)
  (let ((tender (map-get? tenders tender-id)))
    (match tender
      t
        (begin
          (asserts! (is-eq (get creator t) tx-sender) (err ERR-NOT-AUTHORIZED))
          (try! (validate-description update-description))
          (try! (validate-deadline update-submission-deadline))
          (try! (validate-budget update-budget))
          (let ((existing (map-get? tenders-by-description update-description)))
            (match existing
              existing-id
                (asserts! (is-eq existing-id tender-id) (err ERR-TENDER-ALREADY-EXISTS))
              (begin true)
            )
          )
          (let ((old-desc (get description t)))
            (if (is-eq old-desc update-description)
                (ok true)
                (begin
                  (map-delete tenders-by-description old-desc)
                  (map-set tenders-by-description update-description tender-id)
                  (ok true)
                )
            )
          )
          (map-set tenders tender-id
            {
              description: update-description,
              submission-deadline: update-submission-deadline,
              evaluation-criteria: (get evaluation-criteria t),
              budget: update-budget,
              eligibility-requirements: (get eligibility-requirements t),
              timestamp: block-height,
              creator: (get creator t),
              tender-type: (get tender-type t),
              evaluation-method: (get evaluation-method t),
              contract-duration: (get contract-duration t),
              location: (get location t),
              currency: (get currency t),
              status: (get status t),
              min-bid: (get min-bid t),
              max-bid: (get max-bid t),
              start-date: (get start-date t),
              end-date: (get end-date t),
              award-criteria: (get award-criteria t),
              payment-terms: (get payment-terms t),
              delivery-terms: (get delivery-terms t)
            }
          )
          (map-set tender-updates tender-id
            {
              update-description: update-description,
              update-submission-deadline: update-submission-deadline,
              update-budget: update-budget,
              update-timestamp: block-height,
              updater: tx-sender
            }
          )
          (print { event: "tender-updated", id: tender-id })
          (ok true)
        )
      (err ERR-TENDER-NOT-FOUND)
    )
  )
)

(define-public (get-tender-count)
  (ok (var-get next-tender-id))
)

(define-public (check-tender-existence (description (string-utf8 500)))
  (ok (is-tender-registered description))
)
import { describe, it, expect, beforeEach } from "vitest";
import { stringUtf8CV, uintCV } from "@stacks/transactions";

const ERR_NOT_AUTHORIZED = 100;
const ERR_INVALID_DESCRIPTION = 101;
const ERR_INVALID_DEADLINE = 102;
const ERR_INVALID_CRITERIA = 103;
const ERR_INVALID_BUDGET = 104;
const ERR_INVALID_ELIGIBILITY = 105;
const ERR_TENDER_ALREADY_EXISTS = 106;
const ERR_TENDER_NOT_FOUND = 107;
const ERR_INVALID_TENDER_TYPE = 115;
const ERR_INVALID_EVALUATION_METHOD = 116;
const ERR_INVALID_CONTRACT_DURATION = 117;
const ERR_INVALID_LOCATION = 118;
const ERR_INVALID_CURRENCY = 119;
const ERR_INVALID_MIN_BID = 110;
const ERR_INVALID_MAX_BID = 111;
const ERR_MAX_TENDERS_EXCEEDED = 114;
const ERR_INVALID_UPDATE_PARAM = 113;
const ERR_AGENCY_NOT_VERIFIED = 109;
const ERR_INVALID_START_DATE = 121;
const ERR_INVALID_END_DATE = 122;
const ERR_INVALID_AWARD_CRITERIA = 123;
const ERR_INVALID_PAYMENT_TERMS = 124;
const ERR_INVALID_DELIVERY_TERMS = 125;

interface Tender {
  description: string;
  submissionDeadline: number;
  evaluationCriteria: string;
  budget: number;
  eligibilityRequirements: string;
  timestamp: number;
  creator: string;
  tenderType: string;
  evaluationMethod: string;
  contractDuration: number;
  location: string;
  currency: string;
  status: boolean;
  minBid: number;
  maxBid: number;
  startDate: number;
  endDate: number;
  awardCriteria: string;
  paymentTerms: string;
  deliveryTerms: string;
}

interface TenderUpdate {
  updateDescription: string;
  updateSubmissionDeadline: number;
  updateBudget: number;
  updateTimestamp: number;
  updater: string;
}

interface Result<T> {
  ok: boolean;
  value: T;
}

class TenderCreationMock {
  state: {
    nextTenderId: number;
    maxTenders: number;
    creationFee: number;
    agencyRegistryContract: string | null;
    tenders: Map<number, Tender>;
    tenderUpdates: Map<number, TenderUpdate>;
    tendersByDescription: Map<string, number>;
  } = {
    nextTenderId: 0,
    maxTenders: 10000,
    creationFee: 5000,
    agencyRegistryContract: null,
    tenders: new Map(),
    tenderUpdates: new Map(),
    tendersByDescription: new Map(),
  };
  blockHeight: number = 0;
  caller: string = "ST1TEST";
  agencies: Set<string> = new Set(["ST1TEST"]);
  stxTransfers: Array<{ amount: number; from: string; to: string | null }> = [];

  constructor() {
    this.reset();
  }

  reset() {
    this.state = {
      nextTenderId: 0,
      maxTenders: 10000,
      creationFee: 5000,
      agencyRegistryContract: null,
      tenders: new Map(),
      tenderUpdates: new Map(),
      tendersByDescription: new Map(),
    };
    this.blockHeight = 0;
    this.caller = "ST1TEST";
    this.agencies = new Set(["ST1TEST"]);
    this.stxTransfers = [];
  }

  isVerifiedAgency(principal: string): Result<boolean> {
    return { ok: true, value: this.agencies.has(principal) };
  }

  setAgencyRegistryContract(contractPrincipal: string): Result<boolean> {
    if (contractPrincipal === "SP000000000000000000002Q6VF78") {
      return { ok: false, value: false };
    }
    if (this.state.agencyRegistryContract !== null) {
      return { ok: false, value: false };
    }
    this.state.agencyRegistryContract = contractPrincipal;
    return { ok: true, value: true };
  }

  setCreationFee(newFee: number): Result<boolean> {
    if (!this.state.agencyRegistryContract) return { ok: false, value: false };
    this.state.creationFee = newFee;
    return { ok: true, value: true };
  }

  createTender(
    description: string,
    submissionDeadline: number,
    evaluationCriteria: string,
    budget: number,
    eligibilityRequirements: string,
    tenderType: string,
    evaluationMethod: string,
    contractDuration: number,
    location: string,
    currency: string,
    minBid: number,
    maxBid: number,
    startDate: number,
    endDate: number,
    awardCriteria: string,
    paymentTerms: string,
    deliveryTerms: string
  ): Result<number> {
    if (this.state.nextTenderId >= this.state.maxTenders) return { ok: false, value: ERR_MAX_TENDERS_EXCEEDED };
    if (!description || description.length > 500) return { ok: false, value: ERR_INVALID_DESCRIPTION };
    if (submissionDeadline <= this.blockHeight) return { ok: false, value: ERR_INVALID_DEADLINE };
    if (!evaluationCriteria || evaluationCriteria.length > 300) return { ok: false, value: ERR_INVALID_CRITERIA };
    if (budget <= 0) return { ok: false, value: ERR_INVALID_BUDGET };
    if (!eligibilityRequirements || eligibilityRequirements.length > 300) return { ok: false, value: ERR_INVALID_ELIGIBILITY };
    if (!["open", "restricted", "negotiated"].includes(tenderType)) return { ok: false, value: ERR_INVALID_TENDER_TYPE };
    if (!["lowest-price", "best-value", "scored"].includes(evaluationMethod)) return { ok: false, value: ERR_INVALID_EVALUATION_METHOD };
    if (contractDuration <= 0) return { ok: false, value: ERR_INVALID_CONTRACT_DURATION };
    if (!location || location.length > 100) return { ok: false, value: ERR_INVALID_LOCATION };
    if (!["STX", "USD", "BTC"].includes(currency)) return { ok: false, value: ERR_INVALID_CURRENCY };
    if (minBid <= 0) return { ok: false, value: ERR_INVALID_MIN_BID };
    if (maxBid <= 0) return { ok: false, value: ERR_INVALID_MAX_BID };
    if (startDate < this.blockHeight) return { ok: false, value: ERR_INVALID_START_DATE };
    if (endDate <= startDate) return { ok: false, value: ERR_INVALID_END_DATE };
    if (!awardCriteria || awardCriteria.length > 200) return { ok: false, value: ERR_INVALID_AWARD_CRITERIA };
    if (!paymentTerms || paymentTerms.length > 200) return { ok: false, value: ERR_INVALID_PAYMENT_TERMS };
    if (!deliveryTerms || deliveryTerms.length > 200) return { ok: false, value: ERR_INVALID_DELIVERY_TERMS };
    if (!this.isVerifiedAgency(this.caller).value) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (this.state.tendersByDescription.has(description)) return { ok: false, value: ERR_TENDER_ALREADY_EXISTS };
    if (!this.state.agencyRegistryContract) return { ok: false, value: ERR_AGENCY_NOT_VERIFIED };

    this.stxTransfers.push({ amount: this.state.creationFee, from: this.caller, to: this.state.agencyRegistryContract });

    const id = this.state.nextTenderId;
    const tender: Tender = {
      description,
      submissionDeadline,
      evaluationCriteria,
      budget,
      eligibilityRequirements,
      timestamp: this.blockHeight,
      creator: this.caller,
      tenderType,
      evaluationMethod,
      contractDuration,
      location,
      currency,
      status: true,
      minBid,
      maxBid,
      startDate,
      endDate,
      awardCriteria,
      paymentTerms,
      deliveryTerms,
    };
    this.state.tenders.set(id, tender);
    this.state.tendersByDescription.set(description, id);
    this.state.nextTenderId++;
    return { ok: true, value: id };
  }

  getTender(id: number): Tender | null {
    return this.state.tenders.get(id) || null;
  }

  updateTender(id: number, updateDescription: string, updateSubmissionDeadline: number, updateBudget: number): Result<boolean> {
    const tender = this.state.tenders.get(id);
    if (!tender) return { ok: false, value: false };
    if (tender.creator !== this.caller) return { ok: false, value: false };
    if (!updateDescription || updateDescription.length > 500) return { ok: false, value: false };
    if (updateSubmissionDeadline <= this.blockHeight) return { ok: false, value: false };
    if (updateBudget <= 0) return { ok: false, value: false };
    if (this.state.tendersByDescription.has(updateDescription) && this.state.tendersByDescription.get(updateDescription) !== id) {
      return { ok: false, value: false };
    }

    const updated: Tender = {
      ...tender,
      description: updateDescription,
      submissionDeadline: updateSubmissionDeadline,
      budget: updateBudget,
      timestamp: this.blockHeight,
    };
    this.state.tenders.set(id, updated);
    this.state.tendersByDescription.delete(tender.description);
    this.state.tendersByDescription.set(updateDescription, id);
    this.state.tenderUpdates.set(id, {
      updateDescription,
      updateSubmissionDeadline,
      updateBudget,
      updateTimestamp: this.blockHeight,
      updater: this.caller,
    });
    return { ok: true, value: true };
  }

  getTenderCount(): Result<number> {
    return { ok: true, value: this.state.nextTenderId };
  }

  checkTenderExistence(description: string): Result<boolean> {
    return { ok: true, value: this.state.tendersByDescription.has(description) };
  }
}

describe("TenderCreation", () => {
  let contract: TenderCreationMock;

  beforeEach(() => {
    contract = new TenderCreationMock();
    contract.reset();
  });

  it("creates a tender successfully", () => {
    contract.setAgencyRegistryContract("ST2TEST");
    const result = contract.createTender(
      "Road Construction",
      100,
      "Quality and Cost",
      1000000,
      "Licensed Contractors",
      "open",
      "best-value",
      365,
      "City Center",
      "STX",
      500000,
      2000000,
      50,
      150,
      "Technical Score 60%",
      "30% Advance",
      "Within 6 Months"
    );
    expect(result.ok).toBe(true);
    expect(result.value).toBe(0);

    const tender = contract.getTender(0);
    expect(tender?.description).toBe("Road Construction");
    expect(tender?.submissionDeadline).toBe(100);
    expect(tender?.budget).toBe(1000000);
    expect(tender?.tenderType).toBe("open");
    expect(contract.stxTransfers).toEqual([{ amount: 5000, from: "ST1TEST", to: "ST2TEST" }]);
  });

  it("rejects duplicate tender descriptions", () => {
    contract.setAgencyRegistryContract("ST2TEST");
    contract.createTender(
      "Road Construction",
      100,
      "Quality and Cost",
      1000000,
      "Licensed Contractors",
      "open",
      "best-value",
      365,
      "City Center",
      "STX",
      500000,
      2000000,
      50,
      150,
      "Technical Score 60%",
      "30% Advance",
      "Within 6 Months"
    );
    const result = contract.createTender(
      "Road Construction",
      200,
      "Cost Only",
      2000000,
      "Any",
      "restricted",
      "lowest-price",
      730,
      "Suburb",
      "USD",
      1000000,
      3000000,
      60,
      160,
      "Price 100%",
      "Full Payment",
      "Within 12 Months"
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_TENDER_ALREADY_EXISTS);
  });

  it("rejects non-authorized caller", () => {
    contract.setAgencyRegistryContract("ST2TEST");
    contract.caller = "ST2FAKE";
    contract.agencies = new Set();
    const result = contract.createTender(
      "Bridge Project",
      100,
      "Quality and Cost",
      1000000,
      "Licensed Contractors",
      "open",
      "best-value",
      365,
      "City Center",
      "STX",
      500000,
      2000000,
      50,
      150,
      "Technical Score 60%",
      "30% Advance",
      "Within 6 Months"
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_NOT_AUTHORIZED);
  });

  it("rejects tender creation without agency contract", () => {
    const result = contract.createTender(
      "NoAuth Tender",
      100,
      "Quality and Cost",
      1000000,
      "Licensed Contractors",
      "open",
      "best-value",
      365,
      "City Center",
      "STX",
      500000,
      2000000,
      50,
      150,
      "Technical Score 60%",
      "30% Advance",
      "Within 6 Months"
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_AGENCY_NOT_VERIFIED);
  });

  it("rejects invalid submission deadline", () => {
    contract.setAgencyRegistryContract("ST2TEST");
    contract.blockHeight = 50;
    const result = contract.createTender(
      "Invalid Deadline",
      40,
      "Quality and Cost",
      1000000,
      "Licensed Contractors",
      "open",
      "best-value",
      365,
      "City Center",
      "STX",
      500000,
      2000000,
      50,
      150,
      "Technical Score 60%",
      "30% Advance",
      "Within 6 Months"
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_DEADLINE);
  });

  it("rejects invalid budget", () => {
    contract.setAgencyRegistryContract("ST2TEST");
    const result = contract.createTender(
      "Invalid Budget",
      100,
      "Quality and Cost",
      0,
      "Licensed Contractors",
      "open",
      "best-value",
      365,
      "City Center",
      "STX",
      500000,
      2000000,
      50,
      150,
      "Technical Score 60%",
      "30% Advance",
      "Within 6 Months"
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_BUDGET);
  });

  it("rejects invalid tender type", () => {
    contract.setAgencyRegistryContract("ST2TEST");
    const result = contract.createTender(
      "Invalid Type",
      100,
      "Quality and Cost",
      1000000,
      "Licensed Contractors",
      "invalid",
      "best-value",
      365,
      "City Center",
      "STX",
      500000,
      2000000,
      50,
      150,
      "Technical Score 60%",
      "30% Advance",
      "Within 6 Months"
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_TENDER_TYPE);
  });

  it("updates a tender successfully", () => {
    contract.setAgencyRegistryContract("ST2TEST");
    contract.createTender(
      "Old Tender",
      100,
      "Quality and Cost",
      1000000,
      "Licensed Contractors",
      "open",
      "best-value",
      365,
      "City Center",
      "STX",
      500000,
      2000000,
      50,
      150,
      "Technical Score 60%",
      "30% Advance",
      "Within 6 Months"
    );
    const result = contract.updateTender(0, "New Tender", 200, 2000000);
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    const tender = contract.getTender(0);
    expect(tender?.description).toBe("New Tender");
    expect(tender?.submissionDeadline).toBe(200);
    expect(tender?.budget).toBe(2000000);
    const update = contract.state.tenderUpdates.get(0);
    expect(update?.updateDescription).toBe("New Tender");
    expect(update?.updateSubmissionDeadline).toBe(200);
    expect(update?.updateBudget).toBe(2000000);
    expect(update?.updater).toBe("ST1TEST");
  });

  it("rejects update for non-existent tender", () => {
    contract.setAgencyRegistryContract("ST2TEST");
    const result = contract.updateTender(99, "New Tender", 200, 2000000);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(false);
  });

  it("rejects update by non-creator", () => {
    contract.setAgencyRegistryContract("ST2TEST");
    contract.createTender(
      "Test Tender",
      100,
      "Quality and Cost",
      1000000,
      "Licensed Contractors",
      "open",
      "best-value",
      365,
      "City Center",
      "STX",
      500000,
      2000000,
      50,
      150,
      "Technical Score 60%",
      "30% Advance",
      "Within 6 Months"
    );
    contract.caller = "ST3FAKE";
    const result = contract.updateTender(0, "New Tender", 200, 2000000);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(false);
  });

  it("sets creation fee successfully", () => {
    contract.setAgencyRegistryContract("ST2TEST");
    const result = contract.setCreationFee(10000);
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    expect(contract.state.creationFee).toBe(10000);
    contract.createTender(
      "Test Tender",
      100,
      "Quality and Cost",
      1000000,
      "Licensed Contractors",
      "open",
      "best-value",
      365,
      "City Center",
      "STX",
      500000,
      2000000,
      50,
      150,
      "Technical Score 60%",
      "30% Advance",
      "Within 6 Months"
    );
    expect(contract.stxTransfers).toEqual([{ amount: 10000, from: "ST1TEST", to: "ST2TEST" }]);
  });

  it("rejects creation fee change without agency contract", () => {
    const result = contract.setCreationFee(10000);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(false);
  });

  it("returns correct tender count", () => {
    contract.setAgencyRegistryContract("ST2TEST");
    contract.createTender(
      "Tender1",
      100,
      "Quality and Cost",
      1000000,
      "Licensed Contractors",
      "open",
      "best-value",
      365,
      "City Center",
      "STX",
      500000,
      2000000,
      50,
      150,
      "Technical Score 60%",
      "30% Advance",
      "Within 6 Months"
    );
    contract.createTender(
      "Tender2",
      200,
      "Cost Only",
      2000000,
      "Any",
      "restricted",
      "lowest-price",
      730,
      "Suburb",
      "USD",
      1000000,
      3000000,
      60,
      160,
      "Price 100%",
      "Full Payment",
      "Within 12 Months"
    );
    const result = contract.getTenderCount();
    expect(result.ok).toBe(true);
    expect(result.value).toBe(2);
  });

  it("checks tender existence correctly", () => {
    contract.setAgencyRegistryContract("ST2TEST");
    contract.createTender(
      "Test Tender",
      100,
      "Quality and Cost",
      1000000,
      "Licensed Contractors",
      "open",
      "best-value",
      365,
      "City Center",
      "STX",
      500000,
      2000000,
      50,
      150,
      "Technical Score 60%",
      "30% Advance",
      "Within 6 Months"
    );
    const result = contract.checkTenderExistence("Test Tender");
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    const result2 = contract.checkTenderExistence("NonExistent");
    expect(result2.ok).toBe(true);
    expect(result2.value).toBe(false);
  });

  it("rejects tender creation with empty description", () => {
    contract.setAgencyRegistryContract("ST2TEST");
    const result = contract.createTender(
      "",
      100,
      "Quality and Cost",
      1000000,
      "Licensed Contractors",
      "open",
      "best-value",
      365,
      "City Center",
      "STX",
      500000,
      2000000,
      50,
      150,
      "Technical Score 60%",
      "30% Advance",
      "Within 6 Months"
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_DESCRIPTION);
  });

  it("rejects tender creation with max tenders exceeded", () => {
    contract.setAgencyRegistryContract("ST2TEST");
    contract.state.maxTenders = 1;
    contract.createTender(
      "Tender1",
      100,
      "Quality and Cost",
      1000000,
      "Licensed Contractors",
      "open",
      "best-value",
      365,
      "City Center",
      "STX",
      500000,
      2000000,
      50,
      150,
      "Technical Score 60%",
      "30% Advance",
      "Within 6 Months"
    );
    const result = contract.createTender(
      "Tender2",
      200,
      "Cost Only",
      2000000,
      "Any",
      "restricted",
      "lowest-price",
      730,
      "Suburb",
      "USD",
      1000000,
      3000000,
      60,
      160,
      "Price 100%",
      "Full Payment",
      "Within 12 Months"
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_MAX_TENDERS_EXCEEDED);
  });

  it("sets agency registry contract successfully", () => {
    const result = contract.setAgencyRegistryContract("ST2TEST");
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    expect(contract.state.agencyRegistryContract).toBe("ST2TEST");
  });

  it("rejects invalid agency registry contract", () => {
    const result = contract.setAgencyRegistryContract("SP000000000000000000002Q6VF78");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(false);
  });
});
import type { ClaimFailureCode, ClaimFailureDetail } from './types.js';
export {
  CLAIM_INTAKE_APPROVED,
  CLAIM_INTAKE_CLOSED,
  CLAIM_INTAKE_DENIED,
  CLAIM_INTAKE_OPEN,
  CLAIM_INTAKE_SETTLED,
  CLAIM_INTAKE_UNDER_REVIEW,
  OBLIGATION_STATUS_CANCELED,
  OBLIGATION_STATUS_CLAIMABLE_PAYABLE,
  OBLIGATION_STATUS_IMPAIRED,
  OBLIGATION_STATUS_PROPOSED,
  OBLIGATION_STATUS_RECOVERED,
  OBLIGATION_STATUS_RESERVED,
  OBLIGATION_STATUS_SETTLED,
  describeClaimStatus,
  describeObligationStatus,
} from './protocol_models.js';

function collapseFailureText(params: { err: unknown; logs: string[] }): string {
  const errorText =
    params.err instanceof Error ? params.err.message : String(params.err ?? '');
  return [errorText, ...params.logs].join(' ').toLowerCase();
}

function toFailure(
  code: ClaimFailureCode,
  reason: string,
  logs: string[] = [],
  retryable = false,
): ClaimFailureDetail {
  return {
    code,
    reason,
    logs,
    retryable,
  };
}

export function normalizeClaimSimulationFailure(params: {
  err: unknown;
  logs: string[];
}): ClaimFailureDetail {
  const text = collapseFailureText(params);

  if (/claim intake pause|claim intake paused/.test(text)) {
    return toFailure(
      'claim_intake_paused',
      'Claim intake is paused for the current scope.',
      params.logs,
      true,
    );
  }
  if (/protocol emergency pause|protocol paused|operational pause/.test(text)) {
    return toFailure(
      'protocol_paused',
      'Protocol controls currently block the claim flow.',
      params.logs,
      true,
    );
  }
  if (/not eligible|eligibility|member position/.test(text)) {
    return toFailure(
      'not_eligible',
      'The member position is not currently eligible for this claim or payout.',
      params.logs,
      false,
    );
  }
  if (
    /insufficient|funding line|reserve exhausted|budget exhausted/.test(text)
  ) {
    return toFailure(
      'funding_exhausted',
      'The applicable funding line does not have enough free capital.',
      params.logs,
      false,
    );
  }
  if (/allocation freeze|deallocation only/.test(text)) {
    return toFailure(
      'allocation_frozen',
      'Capital allocation controls currently freeze this surface.',
      params.logs,
      true,
    );
  }
  if (/queue only|redemption queue/.test(text)) {
    return toFailure(
      'queue_only',
      'The current capital surface is operating in queue-only mode.',
      params.logs,
      true,
    );
  }
  if (
    /claim state|obligation state|already settled|already closed/.test(text)
  ) {
    return toFailure(
      'invalid_claim_state',
      'The claim or obligation is not in a state that allows this action.',
      params.logs,
      false,
    );
  }

  return toFailure(
    'unknown',
    'Simulation failed for an unclassified claim or obligation reason.',
    params.logs,
    false,
  );
}

export function normalizeClaimRpcFailure(error: unknown): ClaimFailureDetail {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const normalized = message.toLowerCase();

  if (/timed out|timeout|deadline exceeded/.test(normalized)) {
    return toFailure(
      'rpc_timeout',
      'RPC confirmation timed out before the claim transaction reached a terminal state.',
      [],
      true,
    );
  }

  if (
    /fetch failed|network|socket|econnreset|service unavailable/.test(
      normalized,
    )
  ) {
    return toFailure(
      'network_error',
      'A network or RPC transport failure interrupted the claim flow.',
      [],
      true,
    );
  }

  return toFailure(
    'unknown',
    'RPC submission failed for an unclassified reason.',
    [],
    false,
  );
}

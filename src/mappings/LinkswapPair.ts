import { BigInt } from "@graphprotocol/graph-ts"
import {
  LinkswapPair,
  Approval,
  Burn,
  Lock,
  Mint,
  Swap,
  Sync,
  Transfer,
  Unlock
} from "../../generated/templates/LinkswapPair/LinkswapPair"
import { ExampleEntity } from "../../generated/schema"

export function handleApproval(event: Approval): void {}

export function handleBurn(event: Burn): void {}

export function handleLock(event: Lock): void {}

export function handleMint(event: Mint): void {}

export function handleSwap(event: Swap): void {}

export function handleSync(event: Sync): void {}

export function handleTransfer(event: Transfer): void {}

export function handleUnlock(event: Unlock): void {}

/* eslint-disable prefer-const */
import { Pair, Token, Bundle } from '../../generated/schema'
import { log, BigDecimal, Address, BigInt } from '@graphprotocol/graph-ts/index'
import { ZERO_BD, factoryContract, ADDRESS_ZERO, ONE_BD } from './Helpers'

const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const USDC_LINK_PAIR = '0x9d996bdd1f65c835ee92cd0b94e15d886ef14d63' // created 11341486
const DAI_LINK_PAIR = '0x9bf2e78b2201c5bad3c85b1d6a8c3adec6207091' // created block 11389217
const USDT_LINK_PAIR = '0xf36c9fc3c2abe4132019444aff914fc8dc9785a9' // created block 11375833
const BUSD_LINK_PAIR = '0x983c9a1bcf0eb980a232d1b17bffd6bbf68fe4ce' // created block 11389212
const LINK_WETH_PAIR = '0x9f1d5621896c4d075adcd327b0deba48007093cb' // created block 11389439
const LINK_YFL_PAIR = '0x189a730921550314934019d184ec05726881d481' // created block 11375782

export function updateUsdPriceBundle(): Bundle {
  
  // fetch link prices for each stablecoin
  let daiPair = Pair.load(DAI_LINK_PAIR) // dai is token1
  let usdcPair = Pair.load(USDC_LINK_PAIR) // usdc is token1
  let usdtPair = Pair.load(USDT_LINK_PAIR) // usdt is token1
  let busdPair = Pair.load(BUSD_LINK_PAIR) // busd is token0
  
  let linkWETHPair = Pair.load(LINK_WETH_PAIR) // link is token0
  let linkYFLPair = Pair.load(LINK_YFL_PAIR) // link is token1
  
  if(daiPair == null) {
    log.debug('updateUsdPriceBundle: Dai Pair is null', [])
  }
  
  if(usdcPair == null) {
    log.debug('updateUsdPriceBundle: USDC Pair is null', [])
  }
  
  if(usdtPair == null) {
    log.debug('updateUsdPriceBundle: USDT Pair is null', [])
  }
  
  if(busdPair == null) {
    log.debug('updateUsdPriceBundle: BUSD Pair is null', [])
  }
  
  let linkUsdPrice = ZERO_BD
  
  // all 4 have been created
  if (daiPair !== null && usdcPair !== null && usdtPair !== null && busdPair !== null) {
    log.debug('updateUsdPriceBundle: Getting price from DAI-LINK, USDC-LINK, USDT-LINK, BUSD-LINK', [])
    let totalLiquidityLink = daiPair.reserve0.plus(usdcPair.reserve0).plus(usdtPair.reserve0).plus(busdPair.reserve1)
    let daiWeight = daiPair.reserve0.div(totalLiquidityLink)
    let usdcWeight = usdcPair.reserve0.div(totalLiquidityLink)
    let usdtWeight = usdtPair.reserve0.div(totalLiquidityLink)
    let busdWeight = busdPair.reserve1.div(totalLiquidityLink)
    
    linkUsdPrice = daiPair.token1Price.times(daiWeight)
      .plus(usdcPair.token1Price.times(usdcWeight))
      .plus(usdtPair.token1Price.times(usdtWeight))
      .plus(busdPair.token0Price.times(busdWeight))
    
  } else if (daiPair !== null && usdcPair !== null) { // dai and USDC have been created
    log.debug('updateUsdPriceBundle: Getting price from DAI-LINK, USDC-LINK', [])
    let totalLiquidityLink = daiPair.reserve0.plus(usdcPair.reserve0)
    let daiWeight = daiPair.reserve0.div(totalLiquidityLink)
    let usdcWeight = usdcPair.reserve0.div(totalLiquidityLink)
    
    linkUsdPrice = daiPair.token1Price.times(daiWeight)
      .plus(usdcPair.token1Price.times(usdcWeight))
    
  } else if (usdcPair !== null) { // USDC is the only pair so far
    log.debug('updateUsdPriceBundle: Getting price from USDC-LINK', [])
    linkUsdPrice = usdcPair.token1Price
  }
  
  let bundle = Bundle.load('1')
  bundle.linkPrice = linkUsdPrice
  
  if(linkWETHPair !== null) {
    bundle.ethPrice = linkUsdPrice.times(linkWETHPair.token0Price)
  }
  
  if(linkYFLPair !== null) {
    bundle.yflPrice = linkUsdPrice.times(linkYFLPair.token1Price)
  }
  bundle.save()
  
  return bundle as Bundle
}

// token where amounts should contribute to tracked volume and liquidity
let WHITELIST: string[] = [
  
  '0x06f3c323f0238c72bf35011071f2b5b7f43a054c', // MASQ
  '0x0ff6ffcfda92c53f615a4a75d982f399c989366b', // LAYER
  '0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b', // DPI
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', // UNI
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC
  '0x28cb7e841ee97947a86b06fa4090c8451f64c0be', // YFL
  '0x4fabb145d64652a948d72533023f6e7a623c7c53', // BUSD
  '0x514910771af9ca656af840dff83e8264ecf986ca', // LINK
  '0x5dbcf33d8c2e976c6b560249878e6f1491bca25c', // yyDAI+yUSDC+yUSDT+yTUSD
  '0x63b4f3e3fa4e438698ce330e365e831f7ccd1ef4', // CFi
  '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
  '0x6c3f90f043a72fa612cbac8115ee7e52bde6e490', // 3Crv
  '0x6d6506e6f438ede269877a0a720026559110b7d5', // BONK
  '0x79ba92dda26fce15e1e9af47d5cfdfd2a093e000', // SERGS
  '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9', // AAVE
  '0x83f873388cd14b83a9f47fabde3c9850b5c74548', // ZUT
  '0x9d47894f8becb68b9cf3428d256311affe8b068b', // $ROPE
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
  '0xaaaebe6fe48e54f431b0c390cfaf0b017d09d42d', // CEL
  '0xaac41ec512808d64625576eddd580e7ea40ef8b2', // GSWAP
  '0xb1dc9124c395c1e97773ab855d66e879f053a289', // YAX
  '0xb78b3320493a4efaa1028130c5ba26f0b6085ef8', // DRC
  '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f', // SNX
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
  '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
  '0xdec09af123a0d69b8f219198b01ceb36c1d16a57', // wHBAR
  '0xedfbd6c48c3ddff5612ade14b45bb19f916809ba', // RUGZ
  
]


// minimum liquidity required to count towards tracked volume for pairs with small # of Lps
let MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString('400000')

// minimum liquidity for price to get tracked
let MINIMUM_LIQUIDITY_THRESHOLD_ETH = BigDecimal.fromString('2')

/**
 * Search through graph to find derived Eth per token.
 * @todo update to be derived ETH (add stablecoin estimates)
 **/
export function findEthPerToken(token: Token): BigDecimal {
  if (token.id == WETH_ADDRESS) {
    return ONE_BD
  }
  // loop through whitelist and check if paired with any
  for (let i = 0; i < WHITELIST.length; ++i) {
    let pairAddress = factoryContract.getPair(Address.fromString(token.id), Address.fromString(WHITELIST[i]))
    if (pairAddress.toHexString() != ADDRESS_ZERO) {
      let pair = Pair.load(pairAddress.toHexString())
      if (pair.token0 == token.id && pair.reserveETH.gt(MINIMUM_LIQUIDITY_THRESHOLD_ETH)) {
        let token1 = Token.load(pair.token1)
        return pair.token1Price.times(token1.derivedETH as BigDecimal) // return token1 per our token * Eth per token 1
      }
      if (pair.token1 == token.id && pair.reserveETH.gt(MINIMUM_LIQUIDITY_THRESHOLD_ETH)) {
        let token0 = Token.load(pair.token0)
        return pair.token0Price.times(token0.derivedETH as BigDecimal) // return token0 per our token * ETH per token 0
      }
    }
  }
  return ZERO_BD // nothing was found return 0
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD.
 * If both are, return average of two amounts
 * If neither is, return 0
 */
export function getTrackedVolumeUSD(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token,
  pair: Pair
): BigDecimal {
  let bundle = Bundle.load('1')
  let price0 = token0.derivedETH.times(bundle.ethPrice)
  let price1 = token1.derivedETH.times(bundle.ethPrice)

  // if less than 5 LPs, require high minimum reserve amount amount or return 0
  if (pair.liquidityProviderCount.lt(BigInt.fromI32(5))) {
    let reserve0USD = pair.reserve0.times(price0)
    let reserve1USD = pair.reserve1.times(price1)
    if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
      if (reserve0USD.plus(reserve1USD).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
        return ZERO_BD
      }
    }
    if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
      if (reserve0USD.times(BigDecimal.fromString('2')).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
        return ZERO_BD
      }
    }
    if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
      if (reserve1USD.times(BigDecimal.fromString('2')).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
        return ZERO_BD
      }
    }
  }

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0
      .times(price0)
      .plus(tokenAmount1.times(price1))
      .div(BigDecimal.fromString('2'))
  }

  // take full value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0)
  }

  // take full value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(price1)
  }

  // neither token is on white list, tracked volume is 0
  return ZERO_BD
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD * 2.
 * If both are, return sum of two amounts
 * If neither is, return 0
 */
export function getTrackedLiquidityUSD(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token
): BigDecimal {
  let bundle = Bundle.load('1')
  let price0 = token0.derivedETH.times(bundle.ethPrice)
  let price1 = token1.derivedETH.times(bundle.ethPrice)

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).plus(tokenAmount1.times(price1))
  }

  // take double value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).times(BigDecimal.fromString('2'))
  }

  // take double value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(price1).times(BigDecimal.fromString('2'))
  }

  // neither token is on white list, tracked volume is 0
  return ZERO_BD
}

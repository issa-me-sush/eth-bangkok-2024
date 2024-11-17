import { ethers } from 'ethers'
import { ABI, CONTRACT_ADDRESS } from '../contract/abi.js'

export function useContract() {
  const getContract = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
  }

  // Helper functions
  const handleUpvote = async (address: string) => {
    try {
      const contract = getContract()
      await contract.upvote(address)
    } catch (error) {
      console.error('Upvote failed:', error)
      throw error
    }
  }

  const handleDownvote = async (address: string) => {
    try {
      const contract = getContract()
      await contract.downvote(address)
    } catch (error) {
      console.error('Downvote failed:', error)
      throw error
    }
  }

  const handleClaimRewards = async () => {
    try {
      const contract = getContract()
      await contract.claimRewards()
    } catch (error) {
      console.error('Claim failed:', error)
      throw error
    }
  }

  return {
    handleUpvote,
    handleDownvote,
    handleClaimRewards,
    getContract, // Expose this to read contract data directly
  }
}

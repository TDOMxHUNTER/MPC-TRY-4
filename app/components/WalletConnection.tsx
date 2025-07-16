'use client'

import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
import { useEffect, useState, useCallback } from 'react'

export default function WalletConnection() {
  const { open } = useAppKit()
  const { address, isConnected, caipAddress } = useAppKitAccount()
  const { caipNetwork, caipNetworkId } = useAppKitNetwork()
  const [mounted, setMounted] = useState(false)
  const [isOpening, setIsOpening] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Preload AppKit to reduce initial delay
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        try {
          // Trigger initialization without opening
          const modal = document.querySelector('w3m-modal')
          if (modal) {
            modal.setAttribute('data-preloaded', 'true')
          }
        } catch (error) {
          // Suppress console warnings for cleaner output
        }
      }, 100)
    }
  }, [])

  const handleConnect = useCallback(async () => {
    if (isOpening) return
    
    setIsOpening(true)
    try {
      // Immediate UI feedback
      setTimeout(() => {
        open()
        setIsOpening(false)
      }, 50) // Minimal delay for smooth UX
    } catch (error) {
      // Handle error silently for better UX
      setIsOpening(false)
    }
  }, [open, isOpening])

  if (!mounted) {
    return (
      <div className="wallet-connection">
        <button 
          className="wallet-connect-btn loading"
          disabled
          style={{ opacity: 0.7 }}
        >
          <span className="wallet-btn-text">Loading...</span>
          <div className="wallet-btn-glow"></div>
        </button>
      </div>
    )
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="wallet-connection">
      {isConnected && address ? (
        <div className="wallet-info-container">
          <div className="wallet-details">
            <div className="wallet-address-display">
              <span className="wallet-address-label">Address:</span>
              <span className="wallet-address">{formatAddress(address)}</span>
            </div>
            {caipNetwork && (
              <div className="wallet-network-display">
                <span className="wallet-network-label">Network:</span>
                <span className="wallet-network">{caipNetwork.name}</span>
              </div>
            )}
          </div>
          <button 
            onClick={handleConnect}
            className="wallet-connect-btn connected"
          >
            <span className="wallet-btn-text">Manage Wallet</span>
            <div className="wallet-btn-glow"></div>
          </button>
        </div>
      ) : (
        <button 
          onClick={handleConnect}
          className={`wallet-connect-btn ${isOpening ? 'opening' : ''}`}
          disabled={isOpening}
        >
          <span className="wallet-btn-text">
            {isOpening ? 'Opening...' : 'Connect Wallet'}
          </span>
          <div className="wallet-btn-glow"></div>
        </button>
      )}
    </div>
  )
}
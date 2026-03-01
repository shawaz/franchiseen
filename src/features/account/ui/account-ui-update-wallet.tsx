"use client";

import { Address } from 'gill'
import { useState } from 'react'
import { AppModal } from '@/components/default/app-modal'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { usePrivyAuth } from '@/contexts/PrivyAuthContext'
import { toast } from 'sonner'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AccountUiUpdateWallet({ address }: { address: Address }) {
    const [walletId, setWalletId] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { userProfile } = usePrivyAuth()
    const updateWallet = useMutation(api.userManagement.updateUserWalletAddress)
    const [isPending, setIsPending] = useState(false)

    if (!userProfile?._id) {
        return null
    }

    const handleSubmit = async () => {
        if (!walletId) return
        setIsPending(true)
        try {
            await updateWallet({
                userId: userProfile._id as any,
                walletAddress: walletId,
            })
            toast.success('Wallet ID updated successfully')
            setIsModalOpen(false)
            setWalletId('')
        } catch (err) {
            toast.error('Failed to update Wallet ID')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Update Wallet ID
            </Button>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 flex items-center justify-center">
                    <div className="bg-background !max-w-md w-full rounded-md p-6 border shadow-lg m-4">
                        <div className="text-xl font-semibold mb-4">Update Linked Wallet ID</div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="walletId">New Wallet ID / Address</Label>
                                <Input
                                    disabled={isPending}
                                    id="walletId"
                                    onChange={(e) => setWalletId(e.target.value)}
                                    placeholder="Enter wallet address"
                                    type="text"
                                    value={walletId}
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isPending}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} disabled={!walletId || isPending}>
                                {isPending ? 'Updating...' : 'Update Wallet ID'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

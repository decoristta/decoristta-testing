"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { getUserAddresses, addAddress, updateAddress, deleteAddress } from "@/app/actions/addresses";
import styles from "./page.module.css";
import { useAuth } from "@/context/AuthContext";
import { Plus, Edit2, Trash2 } from "lucide-react";

interface Address {
  id: string;
  addressLine: string;
  landmark: string | null;
  state: string;
  city: string;
  pincode: string;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"profile" | "addresses" | "orders">("profile");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editAddressData, setEditAddressData] = useState<{id?: string, addressLine: string, landmark: string, state: string, city: string, pincode: string}>({
    addressLine: '', landmark: '', state: '', city: '', pincode: ''
  });
  const [addressError, setAddressError] = useState("");
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const fetchAddresses = async () => {
    if (user) {
      setIsLoadingAddresses(true);
      const res = await getUserAddresses(user.uid);
      if (res.success && res.addresses) {
        setAddresses(res.addresses as Address[]);
      }
      setIsLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  // Smart Geocoding for Pincode
  useEffect(() => {
    if (editAddressData.pincode.length === 6 && isEditingAddress) {
      const fetchCityState = async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_PINCODE_API_URL || "https://api.postalpincode.in/pincode";
          const res = await fetch(`${apiUrl}/${editAddressData.pincode}`);
          const data = await res.json();
          if (data && data[0] && data[0].Status === "Success") {
            const postOffice = data[0].PostOffice[0];
            setEditAddressData(prev => ({
              ...prev,
              city: postOffice.District,
              state: postOffice.State
            }));
            setAddressError(""); // Clear any previous pincode errors
          } else {
            setAddressError("Invalid Pincode. No region found.");
          }
        } catch (e) {
          console.error("Geocoding error", e);
        }
      };
      fetchCityState();
    }
  }, [editAddressData.pincode, isEditingAddress]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setAddressError("");
    
    // Strict 6 digit validation
    if (!/^\d{6}$/.test(editAddressData.pincode)) {
      setAddressError("Pincode must be exactly 6 digits.");
      return;
    }
    
    try {
      let res;
      if (editAddressData.id) {
        res = await updateAddress(user.uid, editAddressData.id, editAddressData as any);
      } else {
        res = await addAddress(user.uid, editAddressData as any);
      }
      
      if (res.success) {
        setIsEditingAddress(false);
        setEditAddressData({ addressLine: '', landmark: '', state: '', city: '', pincode: '' });
        fetchAddresses(); // Refresh list
      } else {
        setAddressError(res.error || "Failed to save address");
      }
    } catch (err) {
      console.error("Error saving address:", err);
      setAddressError("An unexpected error occurred.");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!user) return;
    try {
      const res = await deleteAddress(user.uid, id);
      if (res.success) {
        fetchAddresses();
      }
    } catch (err) {
      console.error("Error deleting address:", err);
    }
  };

  if (loading || !user || !profile) {
    return <div className={styles.container}>Loading profile...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Account</h1>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <button 
            className={`${styles.navBtn} ${activeTab === 'profile' ? styles.active : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Details
          </button>
          <button 
            className={`${styles.navBtn} ${activeTab === 'addresses' ? styles.active : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            Address Book
          </button>
          <button 
            className={`${styles.navBtn} ${activeTab === 'orders' ? styles.active : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Order History
          </button>
          
          <button className={`${styles.navBtn} ${styles.logoutBtn}`} onClick={handleLogout}>
            Sign Out
          </button>
        </aside>

        <main className={styles.content}>
          {activeTab === 'profile' && (
            <div>
              <h2 className={styles.sectionTitle}>Profile Details</h2>
              <div className={styles.profileDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Full Name</span>
                  <span className={styles.value}>{profile.displayName || profile.name}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Phone Number</span>
                  <span className={styles.value}>{profile.phone}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Email</span>
                  <span className={styles.value}>{profile.email || "Not provided"}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Member Since</span>
                  <span className={styles.value}>
                    {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Recently"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Address Book</h2>
                {!isEditingAddress && (
                  <button 
                    className={styles.addBtnSmall}
                    onClick={() => {
                      setEditAddressData({ addressLine: '', landmark: '', state: '', city: '', pincode: '' });
                      setAddressError("");
                      setIsEditingAddress(true);
                    }}
                  >
                    <Plus size={18} /> Add New Address
                  </button>
                )}
              </div>
              
              {isEditingAddress ? (
                <form onSubmit={handleSaveAddress} className={styles.addressForm}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                      <label className={styles.label}>Flat, House no., Building, Company, Apartment</label>
                      <input 
                        type="text" 
                        className={styles.input} 
                        value={editAddressData.addressLine}
                        onChange={e => setEditAddressData({...editAddressData, addressLine: e.target.value})}
                        required
                        placeholder="123 Design Street, Suite 400"
                      />
                    </div>
                    
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                      <label className={styles.label}>Landmark (Optional)</label>
                      <input 
                        type="text" 
                        className={styles.input} 
                        value={editAddressData.landmark}
                        onChange={e => setEditAddressData({...editAddressData, landmark: e.target.value})}
                        placeholder="E.g. Near Apollo Hospital"
                      />
                    </div>

                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                      <label className={styles.label}>Pincode</label>
                      <input 
                        type="text" 
                        className={styles.input} 
                        value={editAddressData.pincode}
                        onChange={e => {
                          // Only allow numbers, max 6 digits
                          const val = e.target.value.replace(/[^0-9]/g, '').substring(0, 6);
                          setEditAddressData({...editAddressData, pincode: val});
                        }}
                        required
                        pattern="[0-9]{6}"
                        title="Pincode must be exactly 6 digits"
                        placeholder="110001"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Town / City</label>
                      <input 
                        type="text" 
                        className={styles.input} 
                        value={editAddressData.city}
                        onChange={e => setEditAddressData({...editAddressData, city: e.target.value})}
                        required
                        placeholder="New Delhi"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>State</label>
                      <select 
                        className={styles.input}
                        value={editAddressData.state}
                        onChange={e => setEditAddressData({...editAddressData, state: e.target.value})}
                        required
                      >
                        <option value="" disabled>Select a state</option>
                        {INDIAN_STATES.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {addressError && <div className={styles.errorText}>{addressError}</div>}

                  <div className={styles.formActions}>
                    <button type="button" className={styles.cancelBtn} onClick={() => setIsEditingAddress(false)}>Cancel</button>
                    <button type="submit" className={styles.submitBtn}>Save Address</button>
                  </div>
                </form>
              ) : (
                <div className={styles.addressList}>
                  {isLoadingAddresses ? (
                    <p style={{ color: '#666' }}>Loading addresses...</p>
                  ) : addresses.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p>You haven't saved any addresses yet.</p>
                    </div>
                  ) : (
                    addresses.map(addr => (
                      <div key={addr.id} className={styles.addressCard}>
                        <div className={styles.addressDetails}>
                          <p className={styles.addressLinePrimary}>{addr.addressLine}</p>
                          {addr.landmark && <p className={styles.addressLineSecondary}>Near {addr.landmark}</p>}
                          <p className={styles.addressLineSecondary}>{addr.city}, {addr.state} - {addr.pincode}</p>
                        </div>
                        <div className={styles.addressActions}>
                          <button 
                            className={styles.actionBtn} 
                            onClick={() => {
                              setEditAddressData({
                                id: addr.id,
                                addressLine: addr.addressLine,
                                landmark: addr.landmark || '',
                                state: addr.state,
                                city: addr.city,
                                pincode: addr.pincode
                              });
                              setIsEditingAddress(true);
                            }}
                          >
                            <Edit2 size={16} /> Edit
                          </button>
                          <button 
                            className={`${styles.actionBtn} ${styles.deleteBtn}`} 
                            onClick={() => handleDeleteAddress(addr.id)}
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 className={styles.sectionTitle}>Order History</h2>
              <p style={{ color: '#666' }}>You have no past orders yet.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

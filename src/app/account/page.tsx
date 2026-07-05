"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import styles from "./page.module.css";
import { useAuth } from "@/context/AuthContext";
import { Plus, Edit2, Trash2 } from "lucide-react";

interface Address {
  id: string;
  title: string;
  fullAddress: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"profile" | "addresses" | "orders">("profile");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editAddressData, setEditAddressData] = useState<{id?: string, title: string, fullAddress: string}>({ title: '', fullAddress: '' });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "users", user.uid, "addresses"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const addrList: Address[] = [];
        snapshot.forEach((doc) => {
          addrList.push({ id: doc.id, ...doc.data() } as Address);
        });
        setAddresses(addrList);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      if (editAddressData.id) {
        // Update
        const ref = doc(db, "users", user.uid, "addresses", editAddressData.id);
        await updateDoc(ref, {
          title: editAddressData.title,
          fullAddress: editAddressData.fullAddress
        });
      } else {
        // Add new
        await addDoc(collection(db, "users", user.uid, "addresses"), {
          title: editAddressData.title,
          fullAddress: editAddressData.fullAddress
        });
      }
      setIsEditingAddress(false);
      setEditAddressData({ title: '', fullAddress: '' });
    } catch (err) {
      console.error("Error saving address:", err);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "addresses", id));
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
              <h2 className={styles.sectionTitle}>Address Book</h2>
              
              {isEditingAddress ? (
                <form onSubmit={handleSaveAddress}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Address Title (e.g., Home, Work)</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={editAddressData.title}
                      onChange={e => setEditAddressData({...editAddressData, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Full Address</label>
                    <textarea 
                      className={styles.textarea} 
                      value={editAddressData.fullAddress}
                      onChange={e => setEditAddressData({...editAddressData, fullAddress: e.target.value})}
                      required
                      placeholder="123 Design Street, Suite 400..."
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" className={styles.submitBtn}>Save Address</button>
                    <button type="button" className={styles.cancelBtn} onClick={() => setIsEditingAddress(false)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div className={styles.addressList}>
                  {addresses.map(addr => (
                    <div key={addr.id} className={styles.addressCard}>
                      <div className={styles.addressTitle}>{addr.title}</div>
                      <div className={styles.addressText}>{addr.fullAddress}</div>
                      <div className={styles.addressActions}>
                        <button 
                          className={styles.actionBtn} 
                          onClick={() => {
                            setEditAddressData(addr);
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
                  ))}
                  <button 
                    className={styles.addBtn}
                    onClick={() => {
                      setEditAddressData({ title: '', fullAddress: '' });
                      setIsEditingAddress(true);
                    }}
                  >
                    <Plus size={24} />
                    <span>Add New Address</span>
                  </button>
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

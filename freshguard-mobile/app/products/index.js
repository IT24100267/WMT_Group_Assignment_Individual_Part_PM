import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getProducts, deleteProduct } from '../../src/api/products';
import Constants from 'expo-constants';

const CATEGORIES = [
  "All", "Grocery", "Beverages", "Snacks & Sweets", "Bakery",
  "Frozen Food", "Meat & Fish", "Vegetables", "Fruits",
  "Health & Personal Care", "Baby Care", "Household",
];

export default function ProductListScreen() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const debuggerHost = Constants.expoConfig?.hostUri;
  const ip = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';
  const BASE_URL = `http://${ip}:5005`;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      applyFilters(data, searchQuery, selectedCategory);
    } catch (error) {
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (allProducts, search, cat) => {
    let filtered = allProducts;
    
    if (cat !== 'All') {
      filtered = filtered.filter(p => p.mainCategory === cat);
    }
    
    if (search.trim()) {
      filtered = filtered.filter(p => 
        p.productName.toLowerCase().includes(search.toLowerCase()) ||
        p.supplier.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters(products, searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory, products]);

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(id);
              fetchProducts();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  if (loading && products.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007A5E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerText}>Products</Text>
          <Text style={styles.instructionText}>
            Manage your product catalog with pricing and stock visibility.
          </Text>
          <Text style={styles.subHeaderText}>{filteredProducts.length} Total Items</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/products/add')}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search product or supplier..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Filter */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.filterBtn,
                  selectedCategory === cat && styles.filterBtnActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[
                  styles.filterBtnText,
                  selectedCategory === cat && styles.filterBtnTextActive,
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No products found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item._id}
          refreshing={loading}
          onRefresh={fetchProducts}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              
              <TouchableOpacity
                style={styles.cardContent}
                onPress={() => router.push(`/products/${item._id}`)}
              >
                {/* Product Image */}
                <View style={styles.imageContainer}>
                  {item.imageUrl ? (
                    <Image 
                      source={{ uri: item.imageUrl.startsWith('http') ? item.imageUrl : `${BASE_URL}${item.imageUrl}` }} 
                      style={styles.productImage} 
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Text style={styles.placeholderText}>{item.productName.charAt(0)}</Text>
                    </View>
                  )}
                </View>

                {/* Product Info */}
                <View style={styles.infoContainer}>
                  <Text style={styles.productName} numberOfLines={1}>{item.productName}</Text>
                  <Text style={styles.category}>
                    {item.mainCategory} • {item.subCategory}
                  </Text>
                  <Text style={styles.supplier} numberOfLines={1}>Supplier: {item.supplier}</Text>
                  <View style={styles.priceRow}>
                    <View>
                      <Text style={styles.priceLabel}>Cost: <Text style={styles.priceValue}>Rs. {item.costPrice}</Text></Text>
                      <Text style={styles.priceLabel}>Selling: <Text style={styles.priceValue}>Rs. {item.sellingPrice}</Text></Text>
                    </View>
                    {item.stock !== undefined && <Text style={styles.stock}>Stock: {item.stock}</Text>}
                  </View>
                </View>
              </TouchableOpacity>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => router.push(`/products/edit?id=${item._id}`)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item._id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>

            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#007A5E',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  instructionText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4, marginBottom: 8, lineHeight: 18 },
  subHeaderText: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '600' },
  addButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 4,
  },
  addButtonText: { color: '#007A5E', fontWeight: 'bold', fontSize: 14 },
  searchContainer: { padding: 16, backgroundColor: '#007A5E' },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
  },
  filterWrapper: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  filterRow: { flexDirection: 'row', padding: 12, gap: 8 },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterBtnActive: { backgroundColor: '#007A5E', borderColor: '#007A5E' },
  filterBtnText: { fontSize: 13, color: '#64748B' },
  filterBtnTextActive: { color: '#fff', fontWeight: 'bold' },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardContent: { flexDirection: 'row', gap: 12 },
  imageContainer: { width: 80, height: 80, borderRadius: 8, overflow: 'hidden', backgroundColor: '#F1F5F9' },
  productImage: { width: '100%', height: '100%' },
  placeholderImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 24, fontWeight: 'bold', color: '#94A3B8' },
  infoContainer: { flex: 1, justifyContent: 'center' },
  productName: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  category: { fontSize: 12, color: '#007A5E', marginBottom: 2 },
  supplier: { fontSize: 12, color: '#64748B', marginBottom: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  priceLabel: { fontSize: 11, color: '#64748B', marginBottom: 2 },
  priceValue: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  stock: { fontSize: 12, color: '#007A5E', fontWeight: '600' },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  editButton: { backgroundColor: '#F1F5F9', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  editButtonText: { color: '#007A5E', fontWeight: 'bold', fontSize: 13 },
  deleteButton: { backgroundColor: '#FEF2F2', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  deleteButtonText: { color: '#EF4444', fontWeight: 'bold', fontSize: 13 },
  emptyText: { fontSize: 16, color: '#94A3B8', marginTop: 50 },
});
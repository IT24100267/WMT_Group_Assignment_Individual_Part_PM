import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getProductById, deleteProduct } from '../../src/api/products';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const debuggerHost = Constants.expoConfig?.hostUri;
  const ip = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';
  const BASE_URL = `http://${ip}:5005`;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (error) {
        Alert.alert('Error', 'Failed to load product');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleDelete = () => {
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
              Alert.alert('Success', 'Product deleted!', [
                { text: 'OK', onPress: () => router.replace('/products') },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007A5E" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text>Product not found</Text>
      </View>
    );
  }

  const imageUrl = product.imageUrl 
    ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${BASE_URL}${product.imageUrl}`)
    : null;

  return (
    <ScrollView style={styles.container} bounces={false}>
      
      {/* Dynamic Header Overlay */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
          <Text style={styles.circleBtnText}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Product Image Section */}
      <View style={styles.imageHeader}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderIcon}>📦</Text>
            <Text style={styles.imagePlaceholderText}>No Image Available</Text>
          </View>
        )}
      </View>

      {/* Content Body */}
      <View style={styles.contentBody}>
        <View style={styles.titleSection}>
          <Text style={styles.productName}>{product.productName}</Text>
          <Text style={styles.productId}>{product.productId}</Text>
        </View>

        {/* Inventory Section */}
        <Text style={styles.sectionTitle}>Inventory</Text>
        <View style={styles.detailsList}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Stock Level</Text>
              <Text style={[styles.detailText, { color: product.stock < 10 ? '#EF4444' : '#0F172A' }]}>
                {product.stock || 0} units
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Cost Price</Text>
              <Text style={styles.detailText}>Rs. {product.costPrice}</Text>
            </View>
          </View>
        </View>

        {/* Sales Section */}
        <Text style={styles.sectionTitle}>Sales</Text>
        <View style={styles.detailsList}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Units Sold</Text>
              <Text style={styles.detailText}>{product.sales || 0} units</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Total Revenue</Text>
              <Text style={[styles.detailText, { color: '#007A5E' }]}>
                Rs. {(product.sales || 0) * (product.sellingPrice || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Product Details Section */}
        <Text style={styles.sectionTitle}>Product Details</Text>
        <View style={styles.detailsList}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailText}>{product.mainCategory}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Sub Category</Text>
              <Text style={styles.detailText}>{product.subCategory}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Supplier</Text>
              <Text style={styles.detailText}>{product.supplier}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Selling Price</Text>
              <Text style={styles.detailText}>Rs. {product.sellingPrice}</Text>
            </View>
          </View>

          {product.description ? (
            <>
              <View style={styles.divider} />
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Description</Text>
                <Text style={styles.descriptionText}>{product.description}</Text>
              </View>
            </>
          ) : null}
        </View>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push(`/products/edit?id=${id}`)}
          >
            <Text style={styles.editButtonText}>Edit Product</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topNav: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  imageHeader: {
    width: width,
    height: width * 0.8,
    backgroundColor: '#F1F5F9',
  },
  heroImage: { width: '100%', height: '100%' },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: { fontSize: 60, marginBottom: 10 },
  imagePlaceholderText: { color: '#94A3B8', fontSize: 16 },
  contentBody: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    padding: 24,
  },
  titleSection: { marginBottom: 20 },
  productName: { fontSize: 32, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  productId: { fontSize: 14, color: '#64748B', fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginTop: 20, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  priceContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  priceBox: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    justifyContent: 'center',
  },
  priceLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  priceValue: { fontSize: 18, fontWeight: 'bold' },
  detailsList: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  detailText: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  descriptionText: { fontSize: 14, color: '#475569', lineHeight: 20, marginTop: 4 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 15 },
  footer: { gap: 12, marginBottom: 50 },
  editButton: {
    backgroundColor: '#007A5E',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#007A5E',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  editButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  deleteButtonText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 },
});
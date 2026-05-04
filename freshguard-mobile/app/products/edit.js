import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { getProductById, updateProduct, uploadImage } from '../../src/api/products';
import Constants from 'expo-constants';

const MAIN_CATEGORIES = [
  "Grocery", "Beverages", "Snacks & Sweets", "Bakery",
  "Frozen Food", "Meat & Fish", "Vegetables", "Fruits",
  "Health & Personal Care", "Baby Care", "Household",
];

const SUB_CATEGORIES = {
  Grocery: ["Rice & Grains", "Flour", "Pulses", "Spices", "Oil", "Sugar & Salt"],
  Beverages: ["Soft Drinks", "Juice", "Tea & Coffee", "Milk Drinks"],
  "Snacks & Sweets": ["Chips", "Chocolate", "Candy", "Biscuits", "Nuts"],
  Bakery: ["Bread", "Cakes", "Pastries", "Buns"],
  "Frozen Food": ["Frozen Meat", "Frozen Fish", "Frozen Vegetables", "Frozen Snacks"],
  "Meat & Fish": ["Chicken", "Beef", "Fish", "Seafood"],
  Vegetables: ["Leafy", "Root", "Fresh"],
  Fruits: ["Fresh", "Citrus", "Tropical"],
  "Health & Personal Care": ["Soap", "Shampoo", "Toothpaste", "Skincare"],
  "Baby Care": ["Baby Food", "Diapers", "Baby Products"],
  Household: ["Cleaning", "Laundry", "Kitchen Supplies"],
};

export default function EditProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [form, setForm] = useState({
    productName: '',
    mainCategory: '',
    subCategory: '',
    supplier: '',
    costPrice: '',
    sellingPrice: '',
    stock: '',
    sales: '',
    description: '',
    imageUrl: '',
  });

  const debuggerHost = Constants.expoConfig?.hostUri;
  const ip = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';
  const BASE_URL = `http://${ip}:5005`;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setForm({
          productName: data.productName || '',
          mainCategory: data.mainCategory || '',
          subCategory: data.subCategory || '',
          supplier: data.supplier || '',
          costPrice: String(data.costPrice || ''),
          sellingPrice: String(data.sellingPrice || ''),
          stock: String(data.stock || '0'),
          sales: String(data.sales || '0'),
          description: data.description || '',
          imageUrl: data.imageUrl || '',
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to load product');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleChange = (name, value) => {
    if (name === 'mainCategory') {
      setForm({ ...form, mainCategory: value, subCategory: '' });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validate = () => {
    if (!form.productName.trim()) {
      Alert.alert('Error', 'Product name is required');
      return false;
    }
    if (!form.mainCategory) {
      Alert.alert('Error', 'Please select a main category');
      return false;
    }
    if (!form.subCategory) {
      Alert.alert('Error', 'Please select a sub category');
      return false;
    }
    if (!form.supplier.trim()) {
      Alert.alert('Error', 'Supplier is required');
      return false;
    }
    if (!form.costPrice || isNaN(form.costPrice)) {
      Alert.alert('Error', 'Valid cost price is required');
      return false;
    }
    if (!form.sellingPrice || isNaN(form.sellingPrice)) {
      Alert.alert('Error', 'Valid selling price is required');
      return false;
    }
    if (form.stock && isNaN(form.stock)) {
      Alert.alert('Error', 'Stock must be a number');
      return false;
    }
    if (form.sales && isNaN(form.sales)) {
      Alert.alert('Error', 'Sales must be a number');
      return false;
    }
    if (Number(form.costPrice) > Number(form.sellingPrice)) {
      Alert.alert('Error', 'Cost price cannot exceed selling price');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      
      let finalImageUrl = form.imageUrl;
      
      if (imageUri) {
        const uploadRes = await uploadImage(imageUri);
        finalImageUrl = uploadRes.imageUrl;
      }

      await updateProduct(id, {
        productName: form.productName.trim(),
        mainCategory: form.mainCategory,
        subCategory: form.subCategory,
        supplier: form.supplier.trim(),
        costPrice: Number(form.costPrice),
        sellingPrice: Number(form.sellingPrice),
        stock: Number(form.stock) || 0,
        sales: Number(form.sales) || 0,
        description: form.description.trim(),
        imageUrl: finalImageUrl,
      });
      
      Alert.alert('Success', 'Product updated!', [
        { text: 'OK', onPress: () => router.replace('/products') },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/products');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007A5E" />
      </View>
    );
  }

  const getImageSource = () => {
    if (imageUri) return { uri: imageUri };
    if (form.imageUrl) {
      if (form.imageUrl.startsWith('http')) return { uri: form.imageUrl };
      return { uri: `${BASE_URL}${form.imageUrl}` };
    }
    return null;
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>Edit Product</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Product Image (Optional)</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {getImageSource() ? (
              <Image source={getImageSource()} style={styles.previewImage} />
            ) : (
              <Text style={styles.imagePickerText}>Pick an Image</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Fresh Milk 1L"
            value={form.productName}
            onChangeText={(v) => handleChange('productName', v)}
          />

          {/* Main Category */}
          <Text style={styles.label}>Main Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryRow}>
              {MAIN_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryBtn,
                    form.mainCategory === cat && styles.categoryBtnActive,
                  ]}
                  onPress={() => handleChange('mainCategory', cat)}
                >
                  <Text style={[
                    styles.categoryBtnText,
                    form.mainCategory === cat && styles.categoryBtnTextActive,
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Sub Category */}
          {form.mainCategory ? (
            <>
              <Text style={styles.label}>Sub Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryRow}>
                  {SUB_CATEGORIES[form.mainCategory].map((sub) => (
                    <TouchableOpacity
                      key={sub}
                      style={[
                        styles.categoryBtn,
                        form.subCategory === sub && styles.categoryBtnActive,
                      ]}
                      onPress={() => handleChange('subCategory', sub)}
                    >
                      <Text style={[
                        styles.categoryBtnText,
                        form.subCategory === sub && styles.categoryBtnTextActive,
                      ]}>
                        {sub}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </>
          ) : null}

          <Text style={styles.label}>Supplier *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Highland Dairy"
            value={form.supplier}
            onChangeText={(v) => handleChange('supplier', v)}
          />

          <Text style={styles.label}>Cost Price (Rs) *</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            keyboardType="numeric"
            value={form.costPrice}
            onChangeText={(v) => handleChange('costPrice', v)}
          />

          <Text style={styles.label}>Selling Price (Rs) *</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            keyboardType="numeric"
            value={form.sellingPrice}
            onChangeText={(v) => handleChange('sellingPrice', v)}
          />

          <Text style={styles.label}>Current Stock</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 100"
            keyboardType="numeric"
            value={form.stock}
            onChangeText={(v) => handleChange('stock', v)}
          />

          <Text style={styles.label}>Total Sales (Units)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 50"
            keyboardType="numeric"
            value={form.sales}
            onChangeText={(v) => handleChange('sales', v)}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Add product details..."
            multiline
            value={form.description}
            onChangeText={(v) => handleChange('description', v)}
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Update Product</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleBack}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#007A5E', padding: 20, paddingTop: 50 },
  backText: { color: '#fff', fontSize: 14, marginBottom: 8 },
  headerText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  form: { padding: 16 },
  imagePicker: {
    height: 150,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderStyle: 'dashed',
  },
  imagePickerText: { color: '#64748B', fontSize: 15 },
  previewImage: { width: '100%', height: '100%', borderRadius: 10 },
  label: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  categoryRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  categoryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryBtnActive: {
    backgroundColor: '#007A5E',
    borderColor: '#007A5E',
  },
  categoryBtnText: { fontSize: 13, color: '#666' },
  categoryBtnTextActive: { color: '#fff', fontWeight: 'bold' },
  submitButton: {
    backgroundColor: '#007A5E',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelButton: {
    backgroundColor: '#F1F5F9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  cancelText: { color: '#666', fontWeight: 'bold', fontSize: 16 },
});
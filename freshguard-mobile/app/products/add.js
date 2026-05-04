import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { createProduct, uploadImage } from '../../src/api/products';

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

export default function AddProductScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
  });

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
      setLoading(true);
      
      let finalImageUrl = '';
      
      if (imageUri) {
        const uploadRes = await uploadImage(imageUri);
        finalImageUrl = uploadRes.imageUrl;
      }

      await createProduct({
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

      Alert.alert('Success', 'Product added successfully!', [
        { text: 'OK', onPress: () => router.replace('/products') },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Connection failed. Please ensure the backend is running and your phone is on the same Wi-Fi.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/products');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>Add Product</Text>
        </View>

        <View style={styles.form}>
          
          <Text style={styles.label}>Product Image (Optional)</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <View style={styles.pickerInner}>
                <Text style={styles.pickerIcon}>📷</Text>
                <Text style={styles.imagePickerText}>Select Product Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Coffee"
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
              <Text style={styles.label}>Sub Category * ({form.mainCategory})</Text>
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
            placeholder="e.g. ABC Supplier"
            value={form.supplier}
            onChangeText={(v) => handleChange('supplier', v)}
          />

          <View style={styles.priceContainer}>
            <View style={styles.priceInputWrapper}>
              <Text style={styles.label}>Cost Price *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={form.costPrice}
                onChangeText={(v) => handleChange('costPrice', v)}
              />
            </View>
            <View style={styles.priceInputWrapper}>
              <Text style={styles.label}>Selling Price *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={form.sellingPrice}
                onChangeText={(v) => handleChange('sellingPrice', v)}
              />
            </View>
          </View>

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
            placeholder="Add product details, storage info, etc."
            multiline
            value={form.description}
            onChangeText={(v) => handleChange('description', v)}
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Save Product</Text>
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
  header: { backgroundColor: '#007A5E', padding: 20, paddingTop: 50 },
  backText: { color: '#fff', fontSize: 14, marginBottom: 8 },
  headerText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  form: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginBottom: 6, marginTop: 16 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  imagePicker: {
    height: 160,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  pickerInner: { alignItems: 'center' },
  pickerIcon: { fontSize: 32, marginBottom: 8 },
  imagePickerText: { color: '#64748B', fontSize: 14, fontWeight: '500' },
  previewImage: { width: '100%', height: '100%' },
  categoryRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryBtnActive: {
    backgroundColor: '#007A5E',
    borderColor: '#007A5E',
  },
  categoryBtnText: { fontSize: 13, color: '#64748B' },
  categoryBtnTextActive: { color: '#fff', fontWeight: 'bold' },
  priceContainer: { flexDirection: 'row', gap: 12 },
  priceInputWrapper: { flex: 1 },
  submitButton: {
    backgroundColor: '#007A5E',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#007A5E',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelButton: {
    backgroundColor: '#F1F5F9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 50,
  },
  cancelText: { color: '#64748B', fontWeight: 'bold', fontSize: 16 },
});
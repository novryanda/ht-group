# Buyer Module - Quick Start Guide

## 🚀 Quick Start

### 1. Database Migration

The database schema has already been applied. If you need to re-apply:

```bash
npm run db:push
```

### 2. Access the Module

**URL**: `http://localhost:3000/dashboard/pt-pks/datamaster/buyer`

**Required Role**: `PT_PKS_ADMIN` (for create/edit), `EXECUTIVE` or `GROUP_VIEWER` (for view only)

### 3. Create Your First Buyer

1. Login as PT_PKS_ADMIN user
2. Navigate to Data Master → Buyer
3. Click "Tambah Buyer"
4. Fill in the form:

**Minimum Required Fields**:
- Type: Company or Person
- Legal Name: e.g., "PT ABC Indonesia"
- PKP Status: NON_PKP, PKP_11, or PKP_1_1
- Address Line: Full address
- City: e.g., "Jakarta"
- Province: e.g., "DKI Jakarta"
- Billing Email: e.g., "billing@abc.com"
- Phone: e.g., "08123456789"
- Destination Name: e.g., "Gudang Utama"
- Destination Address: Full warehouse address
- At least 1 Contact Person

**Optional Fields**:
- Trade Name
- NPWP (15 digits)
- Postal Code
- Documents

5. Click "Simpan & Terverifikasi"
6. Buyer is created with status VERIFIED

## 📋 Common Scenarios

### Scenario 1: Create Company Buyer with NPWP

```json
{
  "type": "COMPANY",
  "legalName": "PT Maju Jaya",
  "tradeName": "Maju Corp",
  "npwp": "123456789012345",
  "pkpStatus": "PKP_11",
  "addressLine": "Jl. Industri No. 45",
  "city": "Surabaya",
  "province": "Jawa Timur",
  "postalCode": "60123",
  "billingEmail": "finance@majujaya.com",
  "phone": "031-1234567",
  "destinationName": "Gudang Surabaya",
  "destinationAddr": "Jl. Pergudangan No. 10",
  "contacts": [
    {
      "name": "Budi Santoso",
      "role": "Finance Manager",
      "email": "budi@majujaya.com",
      "phone": "08123456789",
      "isBilling": true
    }
  ]
}
```

**Result**: Buyer code `B-202501-001` (example for January 2025)

### Scenario 2: Create Individual Buyer without NPWP

```json
{
  "type": "PERSON",
  "legalName": "Ahmad Wijaya",
  "pkpStatus": "NON_PKP",
  "addressLine": "Jl. Mawar No. 12",
  "city": "Bandung",
  "province": "Jawa Barat",
  "billingEmail": "ahmad.wijaya@email.com",
  "phone": "08987654321",
  "destinationName": "Rumah Ahmad",
  "destinationAddr": "Jl. Mawar No. 12, Bandung",
  "contacts": [
    {
      "name": "Ahmad Wijaya",
      "email": "ahmad.wijaya@email.com",
      "phone": "08987654321",
      "isBilling": true
    }
  ]
}
```

**Result**: Buyer code `B-202501-002`

### Scenario 3: Duplicate Check

**Case 1: Duplicate NPWP**
- Try to create buyer with NPWP `123456789012345`
- System shows warning: "Buyer dengan NPWP 123456789012345 sudah terdaftar"
- Lists existing buyer(s) with same NPWP
- Submit button disabled

**Case 2: Duplicate Name+Location (no NPWP)**
- Try to create buyer with same name, city, and province
- System checks on submit
- Returns 409 Conflict error
- Shows error message with existing buyer info

## 🔍 Search & Filter

### Search Examples

1. **By Buyer Code**: `B-202501-001`
2. **By Name**: `PT Maju` or `Ahmad`
3. **By NPWP**: `123456789012345`

### Filter Combinations

- **All Companies**: Type = COMPANY
- **PKP Buyers**: PKP Status = PKP_11 or PKP_1_1
- **Jakarta Buyers**: City = Jakarta
- **Verified Buyers**: Status = VERIFIED

## 🎯 Integration with Contracts

After creating a buyer, you can immediately create a contract:

1. View buyer detail page
2. Click "Buat Kontrak" button
3. System redirects to contract creation with buyer pre-selected
4. Fill in contract details (price, quantity, delivery terms, etc.)
5. Submit contract

**Note**: Contract module integration is ready via the button, but the contract module itself needs to be implemented separately.

## ⚠️ Important Notes

### NPWP Validation
- Must be exactly 15 digits
- Only numbers allowed
- Automatically checked for duplicates
- Optional but recommended for PKP buyers

### Buyer Code Format
- Format: `B-YYYYMM-###`
- Auto-generated on creation
- Unique per buyer
- Sequence resets monthly

### Status Flow
- New buyers: `VERIFIED` (auto)
- Can be changed to: `INACTIVE` (soft delete)
- Cannot be changed to: `DRAFT` (not used for admin-created buyers)

### Contact Requirements
- Minimum 1 contact required
- Email must be valid
- Phone minimum 8 characters
- One contact can be marked as billing contact

## 🐛 Troubleshooting

### Issue: "Buyer dengan NPWP ... sudah terdaftar"
**Solution**: Check if NPWP is correct. If duplicate is intentional, leave NPWP empty or use different NPWP.

### Issue: "Minimal 1 kontak wajib diisi"
**Solution**: Add at least one contact person with name, email, and phone.

### Issue: "NPWP harus 15 digit angka"
**Solution**: Ensure NPWP is exactly 15 digits, numbers only.

### Issue: Cannot create buyer (403 Forbidden)
**Solution**: Check your role. Only PT_PKS_ADMIN can create buyers.

### Issue: Buyer not appearing in list
**Solution**: Check filters and search. Try clearing all filters.

## 📊 API Testing with cURL

### Create Buyer
```bash
curl -X POST http://localhost:3000/api/buyers \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "type": "COMPANY",
    "legalName": "PT Test",
    "pkpStatus": "NON_PKP",
    "addressLine": "Jl. Test",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "billingEmail": "test@test.com",
    "phone": "08123456789",
    "destinationName": "Gudang Test",
    "destinationAddr": "Jl. Gudang",
    "contacts": [{
      "name": "Test User",
      "email": "user@test.com",
      "phone": "08123456789",
      "isBilling": true
    }]
  }'
```

### List Buyers
```bash
curl http://localhost:3000/api/buyers?page=1&pageSize=10 \
  -H "Cookie: your-session-cookie"
```

### Check Duplicate
```bash
curl "http://localhost:3000/api/buyers/check?npwp=123456789012345" \
  -H "Cookie: your-session-cookie"
```

## 📚 Next Steps

1. **Create Multiple Buyers**: Practice creating different types of buyers
2. **Test Duplicate Prevention**: Try creating duplicates to see validation
3. **Explore Filters**: Use different filter combinations
4. **View Details**: Click on buyers to see full details
5. **Prepare for Contracts**: Ensure buyers have complete information for contract creation

## 🔗 Related Documentation

- [Full Module Documentation](./BUYER_MODULE.md)
- [API Reference](./BUYER_MODULE.md#-api-endpoints)
- [Architecture Details](./BUYER_MODULE.md#-arsitektur)


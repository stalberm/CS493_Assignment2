const axios = require('axios');
const { ObjectId } = require('mongodb');
const userId = new ObjectId().toString();
const API_URL = 'http://localhost:8000';

let businessId;
let photoId;
let reviewId;

describe('Business Endpoint Tests', () => {

    const business = {
        ownerid: userId,
        name: "Test Business Name",
        address: "Business Address",
        city: "Redmond",
        state: "Oregon",
        zip: 97756,
        phone: "5411234567",
        category: "School",
        subcategory: "College",
        website: "me.com",
    };

    test('POST /businesses', async () => {
        const response = await axios.post(`${API_URL}/businesses`, business);
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty("id");
        expect(response.data).toHaveProperty("links");
        businessId = response.data.id;
    });

    test('GET /businesses', async () => {
        const response = await axios.get(`${API_URL}/businesses`);
        expect(response.status).toBe(200);
    });

    test('GET /businesses/:businessid', async () => {
        const response = await axios.get(`${API_URL}/businesses/${businessId}`);
        expect(response.status).toBe(200);
    });

    test('PUT /businesses/:businessid', async () => {
        business.name = "Updated Business Name";
        const response = await axios.put(`${API_URL}/businesses/${businessId}`, business);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("links");
    })

    test('DELETE /businesses/:businessid', async () => {
        business.name = "Updated Business Name";
        const response = await axios.delete(`${API_URL}/businesses/${businessId}`);
        expect(response.status).toBe(204);
    })
});


describe('Photo Endpoint Tests', () => {
    let businessId;
    let photo;

    const business = {
        ownerid: userId,
        name: "Test Business With Photo Name",
        address: "Business Address",
        city: "Redmond",
        state: "Oregon",
        zip: 97756,
        phone: "5411234567",
        category: "School",
        subcategory: "College",
        website: "me.com",
    };

    beforeAll(async () => {
        const response = await axios.post(`${API_URL}/businesses`, business);

        businessId = response.data.id;
        photo = {
            userid: userId,
            businessid: businessId,
            caption: "Test Review Caption"
        };
    });

    test('POST /photos', async () => {
        const response = await axios.post(`${API_URL}/photos`, photo);
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty("id");
        expect(response.data).toHaveProperty("links");
        photoId = response.data.id;
    });

    test('GET /photos/:photoid', async () => {
        const response = await axios.get(`${API_URL}/photos/${photoId}`);
        expect(response.status).toBe(200);
    });

    test('PUT /photos/:photoid', async () => {
        photo.caption = "Updated Photo Caption";
        const response = await axios.put(`${API_URL}/photos/${photoId}`, photo);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("links");
    })

    test('DELETE /photos/:photoid', async () => {
        const response = await axios.delete(`${API_URL}/photos/${photoId}`);
        expect(response.status).toBe(204);
    })
});
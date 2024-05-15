const axios = require('axios');
const API_URL = 'http://localhost:8000';

const adminEmail = "admin@example.com"
const adminPass = "hunter2"

const user = {
    name: "Test User",
    email: "example@example.com",
    password: "testpass"
}

const user1 = {
    name: "Test User1",
    email: "example1@example.com",
    password: "testpass"
}

const user2 = {
    name: "Test User2",
    email: "example2@example.com",
    password: "testpass"
}

let validAdminToken;
let validUserToken;
let validUser2Token;
let user2Id;
let userId;

describe('User Endpoint Tests', () => {

    beforeAll(async () => {
        const loginResponse = await axios.post(`${API_URL}/users/login`, { "email": adminEmail, "password": adminPass });
        validAdminToken = loginResponse.data.token;
        console.log(validAdminToken);
    });

    test('POST /users/login Admin Wrong Creds', async () => {
        try {
            await axios.post(`${API_URL}/users/login`, { "email": adminEmail, "password": "wrongpass" });
        } catch (error) {
            expect(error.response.status).toBe(401);
        }
    })

    test('POST /users Admin Without Admin Status', async () => {
        user1.admin = true;
        try {
            await axios.post(`${API_URL}/users`, user1);
        } catch (error) {
            expect(error.response.status).toBe(403)
        }
    })

    test('POST /users Non Admin Without Admin Status', async () => {
        user1.admin = false;
        const response = await axios.post(`${API_URL}/users`, user1);
        expect(response.status).toBe(201);
    })


    test('POST /users With Admin Status', async () => {
        const headers = {
            'Authorization': `Bearer ${validAdminToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.post(`${API_URL}/users`, user, config);
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty("id");
        userId = response.data.id;

        const response2 = await axios.post(`${API_URL}/users`, user2, config);
        expect(response2.status).toBe(201);
        expect(response2.data).toHaveProperty("id");
        user2Id = response2.data.id;
    })

    test('POST /users/login Regular User', async () => {
        const response = await axios.post(`${API_URL}/users/login`, { "email": user.email, "password": user.password });
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("token");
        validUserToken = response.data.token;

        const response2 = await axios.post(`${API_URL}/users/login`, { "email": user2.email, "password": user2.password });
        expect(response2.status).toBe(200);
        expect(response2.data).toHaveProperty("token");
        validUser2Token = response2.data.token;
    })

    test('POST /users/login Regular User Wrong Creds', async () => {
        try {
            await axios.post(`${API_URL}/users/login`, { "email": user.email, "password": user2.password });
        } catch (error) {
            expect(error.response.status).toBe(401);
        }
    })


    test('GET /users/:userid As User', async () => {
        const headers = {
            'Authorization': `Bearer ${validUserToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.get(`${API_URL}/users/${userId}`, config);
        expect(response.status).toBe(200);
        expect(response.data.email).toEqual(user.email);
        expect(response.data.name).toEqual(user.name);

    })

    test('GET /users/:userid As Admin', async () => {
        const headers = {
            'Authorization': `Bearer ${validAdminToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.get(`${API_URL}/users/${userId}`, config);
        expect(response.status).toBe(200);
        expect(response.data.email).toEqual(user.email);
        expect(response.data.name).toEqual(user.name);
    })

    test('GET /users/:userid As Invalid Token', async () => {
        const headers = {
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }

        try {
            await axios.get(`${API_URL}/users/${userId}`, config);
        } catch (error) {
            expect(error.response.status).toBe(401);
        }
    })
    //businesses
    test('GET /users/:userid/businesses', async () => {
        const headers = {
            'Authorization': `Bearer ${validUserToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.get(`${API_URL}/users/${userId}/businesses`, config);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("businesses");
    })

    test('GET /users/:userid/businesses As Admin', async () => {
        const headers = {
            'Authorization': `Bearer ${validAdminToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.get(`${API_URL}/users/${userId}/businesses`, config);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("businesses");
    })

    test('GET /users/:userid/businesses As Invalid Token', async () => {
        const headers = {
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        try {
            await axios.get(`${API_URL}/users/${userId}/businesses`, config);
        } catch (error) {
            expect(error.response.status).toBe(401);
        }
    })
    //photos
    test('GET /users/:userid/photos', async () => {
        const headers = {
            'Authorization': `Bearer ${validUserToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.get(`${API_URL}/users/${userId}/photos`, config);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("photos");
    })

    test('GET /users/:userid/photos As Admin', async () => {
        const headers = {
            'Authorization': `Bearer ${validAdminToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.get(`${API_URL}/users/${userId}/photos`, config);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("photos");
    })

    test('GET /users/:userid/photos As Invalid Token', async () => {
        const headers = {
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        try {
            await axios.get(`${API_URL}/users/${userId}/photos`, config);
        } catch (error) {
            expect(error.response.status).toBe(401);
        }
    })
    //Reviews
    test('GET /users/:userid/reviews', async () => {
        const headers = {
            'Authorization': `Bearer ${validUserToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.get(`${API_URL}/users/${userId}/reviews`, config);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("reviews");
    })

    test('GET /users/:userid/reviews As Admin', async () => {
        const headers = {
            'Authorization': `Bearer ${validAdminToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.get(`${API_URL}/users/${userId}/reviews`, config);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("reviews");
    })

    test('GET /users/:userid/reviews As Invalid Token', async () => {
        const headers = {
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        try {
            await axios.get(`${API_URL}/users/${userId}/reviews`, config);
        } catch (error) {
            expect(error.response.status).toBe(401);
        }
    })
});

let userBusinessId;
let userBusiness2Id;
let userBusiness3Id;

describe('Business Endpoint Tests', () => {

    test('POST /businesses As Admin', async () => {
        const business = {
            ownerid: userId,
            name: "Test Business",
            address: "Test Add",
            city: "Test City",
            state: "Test State",
            zip: "Test Zip",
            phone: "Test Phone",
            category: "Test Cat",
            subcategory: "Test SubCat"
        };
        const headers = {
            'Authorization': `Bearer ${validAdminToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.post(`${API_URL}/businesses`, business, config);
        expect(response.status).toBe(201);
    })

    test('POST /businesses As User', async () => {
        const business = {
            ownerid: userId,
            name: "New Test Business",
            address: "Test Add",
            city: "Test City",
            state: "Test State",
            zip: "Test Zip",
            phone: "Test Phone",
            category: "Test Cat",
            subcategory: "Test SubCat"
        };
        const headers = {
            'Authorization': `Bearer ${validUserToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.post(`${API_URL}/businesses`, business, config);
        expect(response.status).toBe(201);
        userBusinessId = response.data.id

        business.name = "Second Business";
        const response2 = await axios.post(`${API_URL}/businesses`, business, config);
        expect(response2.status).toBe(201);
        userBusiness2Id = response2.data.id

        business.name = "Third Business";
        const response3 = await axios.post(`${API_URL}/businesses`, business, config);
        expect(response3.status).toBe(201);
        userBusiness3Id = response3.data.id
    });

    test('POST /businesses As Wrong User', async () => {
        const business = {
            ownerid: userId,
            name: "New Test Business",
            address: "Test Add",
            city: "Test City",
            state: "Test State",
            zip: "Test Zip",
            phone: "Test Phone",
            category: "Test Cat",
            subcategory: "Test SubCat"
        };
        const headers = {
            'Authorization': `Bearer ${validUser2Token}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        try {
            await axios.post(`${API_URL}/businesses`, business, config);
        } catch (error) {
            expect(error.response.status).toBe(403);
        }
    });

    test('PUT /businesses/:businessid As User', async () => {
        const business = {
            ownerid: userId,
            name: "Test Business Edit",
            address: "Test Add",
            city: "Test City",
            state: "Test State",
            zip: "Test Zip",
            phone: "Test Phone",
            category: "Test Cat",
            subcategory: "Test SubCat"
        };
        const headers = {
            'Authorization': `Bearer ${validUserToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.put(`${API_URL}/businesses/${userBusinessId}`, business, config);
        expect(response.status).toBe(200);
    })

    test('PUT /businesses/:businessid As Admin', async () => {
        const business = {
            ownerid: userId,
            name: "Test Business Admin Edit",
            address: "Test Add",
            city: "Test City",
            state: "Test State",
            zip: "Test Zip",
            phone: "Test Phone",
            category: "Test Cat",
            subcategory: "Test SubCat"
        };
        const headers = {
            'Authorization': `Bearer ${validAdminToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.put(`${API_URL}/businesses/${userBusinessId}`, business, config);
        expect(response.status).toBe(200);
    })

    test('PUT /businesses/:businessid As Wrong User', async () => {
        const business = {
            ownerid: userId,
            name: "Test Business Wrong Edit",
            address: "Test Add",
            city: "Test City",
            state: "Test State",
            zip: "Test Zip",
            phone: "Test Phone",
            category: "Test Cat",
            subcategory: "Test SubCat"
        };
        const headers = {
            'Authorization': `Bearer ${validUser2Token}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        try {
            await axios.put(`${API_URL}/businesses/${userBusinessId}`, business, config);
        } catch (error) {
            expect(error.response.status).toBe(403);
        }
    })

    test('DELETE /businesses/:businessid As Admin', async () => {
        const headers = {
            'Authorization': `Bearer ${validAdminToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.delete(`${API_URL}/businesses/${userBusinessId}`, config);
        expect(response.status).toBe(204);
    })

    test('DELETE /businesses/:businessid As Wrong User', async () => {
        const headers = {
            'Authorization': `Bearer ${validUser2Token}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        try {
            await axios.delete(`${API_URL}/businesses/${userBusiness2Id}`, config);
        } catch (error) {
            expect(error.response.status).toBe(403);
        }
    })

    test('DELETE /businesses/:businessid As User', async () => {
        const headers = {
            'Authorization': `Bearer ${validUserToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.delete(`${API_URL}/businesses/${userBusiness2Id}`, config);
        expect(response.status).toBe(204);
    })
});

let userReviewId;
let userReview2Id;

describe('Review Endpoint Tests', () => {

    test('POST /review As Admin', async () => {
        const review = {
            userid: user2Id,
            businessid: userBusiness3Id,
            dollars: "5",
            stars: "5",
            review: "Test Review"
        };

        const headers = {
            'Authorization': `Bearer ${validAdminToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.post(`${API_URL}/reviews`, review, config);
        expect(response.status).toBe(201);
    })

    test('POST /review As User', async () => {
        const review = {
            userid: userId,
            businessid: userBusiness3Id,
            dollars: "5",
            stars: "5",
            review: "Test Review"
        };

        const headers = {
            'Authorization': `Bearer ${validUserToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.post(`${API_URL}/reviews`, review, config);
        expect(response.status).toBe(201);
        userReviewId = response.data.id;

        review.businessid = userBusiness2Id;
        const response2 = await axios.post(`${API_URL}/reviews`, review, config);
        expect(response2.status).toBe(201);
        userReview2Id = response2.data.id;
    });

    test('POST /reviews As Wrong User', async () => {
        const review = {
            userid: userId,
            businessid: userBusiness3Id,
            dollars: "5",
            stars: "5",
            review: "Test Review"
        };
        const headers = {
            'Authorization': `Bearer ${validUser2Token}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        try {
            await axios.post(`${API_URL}/reviews`, review, config);
        } catch (error) {
            expect(error.response.status).toBe(403);
        }
    });

    test('PUT /reviews/:reviewid As User', async () => {
        const review = {
            userid: userId,
            businessid: userBusiness3Id,
            dollars: "5",
            stars: "5",
            review: "Test Review Edit"
        };
        const headers = {
            'Authorization': `Bearer ${validUserToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.put(`${API_URL}/reviews/${userReviewId}`, review, config);
        expect(response.status).toBe(200);
    })

    test('PUT /reviews/:reviewid As Admin', async () => {
        const review = {
            userid: userId,
            businessid: userBusiness3Id,
            dollars: "5",
            stars: "5",
            review: "Test Review Edit Admin"
        };
        const headers = {
            'Authorization': `Bearer ${validAdminToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.put(`${API_URL}/reviews/${userReviewId}`, review, config);
        expect(response.status).toBe(200);
    })

    test('PUT /reviews/:reviewid As Wrong User', async () => {
        const review = {
            userid: userId,
            businessid: userBusiness3Id,
            dollars: "5",
            stars: "5",
            review: "Test Review Edit Admin"
        };
        const headers = {
            'Authorization': `Bearer ${validUser2Token}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        try {
            await axios.put(`${API_URL}/reviews/${userReviewId}`, review, config);
        } catch (error) {
            expect(error.response.status).toBe(403);
        }
    })

    test('DELETE /reviews/:reviewid As Admin', async () => {
        const headers = {
            'Authorization': `Bearer ${validAdminToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.delete(`${API_URL}/reviews/${userReview2Id}`, config);
        expect(response.status).toBe(204);
    })

    test('DELETE /reviews/:reviewid As Wrong User', async () => {
        const headers = {
            'Authorization': `Bearer ${validUser2Token}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }

        try {
            await axios.delete(`${API_URL}/reviews/${userReviewId}`, config);
        } catch (error) {
            expect(error.response.status).toBe(403);
        }
    })

    test('DELETE /reviews/:reviewid As User', async () => {
        const headers = {
            'Authorization': `Bearer ${validUserToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.delete(`${API_URL}/reviews/${userReviewId}`, config);
        expect(response.status).toBe(204);
    })
});

let userPhotoId;
let userPhoto2Id;

describe('Photo Endpoint Tests', () => {

    test('POST /photos As Admin', async () => {
        const photo = {
            userid: userId,
            businessid: userBusiness3Id,
            caption: "Test Caption"
        };

        const headers = {
            'Authorization': `Bearer ${validAdminToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.post(`${API_URL}/photos`, photo, config);
        expect(response.status).toBe(201);
    })

    test('POST /photos As User', async () => {
        const photo = {
            userid: userId,
            businessid: userBusiness3Id,
            caption: "Test Caption"
        };

        const headers = {
            'Authorization': `Bearer ${validUserToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }

        const response = await axios.post(`${API_URL}/photos`, photo, config);
        expect(response.status).toBe(201);
        userPhotoId = response.data.id;

        photo.businessid = userBusiness2Id;
        const response2 = await axios.post(`${API_URL}/photos`, photo, config);
        expect(response2.status).toBe(201);
        userPhoto2Id = response2.data.id;
    });

    test('POST /photos As Wrong User', async () => {
        const photo = {
            userid: userId,
            businessid: userBusiness3Id,
            caption: "Test Caption"
        };

        const headers = {
            'Authorization': `Bearer ${validUser2Token}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }

        try {
            await axios.post(`${API_URL}/photos`, photo, config);
        } catch (error) {
            expect(error.response.status).toBe(403);
        }
    });

    test('PUT /photos/:photoID As User', async () => {
        const photo = {
            userid: userId,
            businessid: userBusiness3Id,
            caption: "Test Caption"
        };
        const headers = {
            'Authorization': `Bearer ${validUserToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.put(`${API_URL}/photos/${userPhotoId}`, photo, config);
        expect(response.status).toBe(200);
    })

    test('PUT /photos/:photoID As Admin', async () => {
        const photo = {
            userid: userId,
            businessid: userBusiness3Id,
            caption: "Test Caption"
        };
        const headers = {
            'Authorization': `Bearer ${validAdminToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.put(`${API_URL}/photos/${userPhotoId}`, photo, config);
        expect(response.status).toBe(200);
    })

    test('PUT /photos/:photoID As Wrong User', async () => {
        const photo = {
            userid: userId,
            businessid: userBusiness3Id,
            caption: "Test Caption"
        };
        const headers = {
            'Authorization': `Bearer ${validUser2Token}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        try {
            await axios.put(`${API_URL}/photos/${userPhotoId}`, photo, config);
        } catch (error) {
            expect(error.response.status).toBe(403);
        }
    })

    test('DELETE /photos/:photoID As Admin', async () => {
        const headers = {
            'Authorization': `Bearer ${validAdminToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.delete(`${API_URL}/photos/${userPhoto2Id}`, config);
        expect(response.status).toBe(204);
    })

    test('DELETE /photos/:photoID As Wrong User', async () => {
        const headers = {
            'Authorization': `Bearer ${validUser2Token}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }

        try {
            await axios.delete(`${API_URL}/photos/${userPhotoId}`, config);
        } catch (error) {
            expect(error.response.status).toBe(403);
        }
    })

    test('DELETE /photos/:photoID As User', async () => {
        const headers = {
            'Authorization': `Bearer ${validUserToken}`,
            'Content-Type': 'application/json'
        };
        const config = {
            headers: headers
        }
        const response = await axios.delete(`${API_URL}/photos/${userPhotoId}`, config);
        expect(response.status).toBe(204);
    })
});

const app = require("../server");
const request = require("supertest");

describe("User Module", () => {
  it("should register a user", async () => {
    const res = await request(app).post("/api/user/register").send({
      username: "testuser",
      email: "test@gmail.com",
      password: "testpassword",
      address: "testaddress",
      phone: "1234567890",
      role: "customer",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body).toHaveProperty("token");
  });
});

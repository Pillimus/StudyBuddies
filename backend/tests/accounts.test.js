const express = require("express");
const request = require("supertest");
const { ObjectId } = require("mongodb");
const account = require("../account");

test("GET /users", () => {
  it("should return list of users", async () => {
    const response = await request(app).get("/users");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([{ name: "John Doe" }]);
  });
});

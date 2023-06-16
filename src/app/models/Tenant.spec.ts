import mongoose from "mongoose";
import Tenant from "./Tenant";

describe("Tenant Model", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/test");
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Tenant.deleteMany({});
  });

  it("should update updatedAt property when a tenant is updated", async () => {
    const tenantData = {
      cnpj: "123456789",
      responsavel: "John Doe",
      contato: "john.doe@example.com",
      provedor: {
        nome: "Example Provider",
      },
      database: {
        name: "example_db",
        dialect: "mongodb",
        host: "localhost",
        username: "admin",
        password: "password",
      },
      assinatura: {
        valor: 100,
        data_vencimento: new Date(),
        dia_vencimento: "1st",
        ativa: true,
      },
      usuario: "john.doe",
      senha: "password",
    };

    const tenant = new Tenant(tenantData);
    await tenant.save();

    const updatedTenant = await Tenant.findOneAndUpdate(
      { cnpj: tenantData.cnpj },
      { responsavel: "Jane Doe" },
      { new: true }
    );

    expect(updatedTenant!.updatedAt).not.toEqual(tenant.createdAt);
  });
});

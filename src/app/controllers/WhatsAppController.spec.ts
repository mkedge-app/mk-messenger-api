describe("test mk_messenger_api", function () {
  it("test mk-messenger-api.WhatsappController.create", function (done) {
    let req = {
      isTenantActive: true,
      tenantId: "tenantId",
    };
    let res = {
      status: function (code) {
        return {
          json: function (data) {
            assert.equal(code, 200);
            assert.notEqual(data.qrcode, null);
            done();
          },
        };
      },
    };
    mk_messenger_api.WhatsappController.create(req, res);
  });
});

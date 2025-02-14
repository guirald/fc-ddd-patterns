import CustomerAddressChangedEvent from "../../customer/event/customer-address-changed.event";
import CustomerCreatedEvent from "../../customer/event/customer-created.event";
import EnviaConsoleLog1WhenCustomerIsCreatedHandler from "../../customer/event/handler/envia-console-log-1-when-customer-is-created.handler";
import EnviaConsoleLog2WhenCustomerIsCreatedHandler from "../../customer/event/handler/envia-console-log-2-when-customer-is-created.handler";
import EnviaConsoleLogWhenCustomerAddressIsChangedHandler from "../../customer/event/handler/envia-console-log-when-customer-address-is-changed.handler";
import SendEmailWhenProductIsCreatedHandler from "../../product/event/handler/send-email-when-product-is-created.handler";
import ProductCreatedEvent from "../../product/event/product-created.event";
import EventDispatcher from "./event-dispatcher";

describe("Domain events tests", () => {
  it("should register an event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeDefined();
    expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"].length).toBe(
      1
    );
    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);
  });

  it("should unregister an event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    eventDispatcher.unregister("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeDefined();
    expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"].length).toBe(
      0
    );
  });

  it("should unregister all event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    eventDispatcher.unregisterAll();

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeUndefined();
  });

  it("should notify all event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();
    const spyEventHandler = jest.spyOn(eventHandler, "handle");

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    const productCreatedEvent = new ProductCreatedEvent({
      name: "Product 1",
      description: "Product 1 description",
      price: 10.0,
    });

    // Quando o notify for executado o SendEmailWhenProductIsCreatedHandler.handle() deve ser chamado
    eventDispatcher.notify(productCreatedEvent);

    expect(spyEventHandler).toHaveBeenCalled();
  });

  it("should notify all customer event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    
    const enviaConsoleLog1Handler = new EnviaConsoleLog1WhenCustomerIsCreatedHandler();
    const enviaConsoleLog2Handler = new EnviaConsoleLog2WhenCustomerIsCreatedHandler();
    const enviaConsoleLogHandler = new EnviaConsoleLogWhenCustomerAddressIsChangedHandler();
    
    const spyEventHandler1 = jest.spyOn(enviaConsoleLog1Handler, "handle");
    const spyEventHandler2 = jest.spyOn(enviaConsoleLog2Handler, "handle");
    const spyEventHandler = jest.spyOn(enviaConsoleLogHandler, "handle");
    
    eventDispatcher.register("CustomerCreatedEvent", enviaConsoleLog1Handler);
    eventDispatcher.register("CustomerCreatedEvent", enviaConsoleLog2Handler);
    eventDispatcher.register("CustomerAddressChangedEvent", enviaConsoleLogHandler);

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
    ).toMatchObject(enviaConsoleLog1Handler);

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1]
    ).toMatchObject(enviaConsoleLog2Handler);

    expect(
      eventDispatcher.getEventHandlers["CustomerAddressChangedEvent"][0]
    ).toMatchObject(enviaConsoleLogHandler);

    const customerCreatedEvent = new CustomerCreatedEvent({
      id: "123",
      name: "Fulano",
    });

    eventDispatcher.notify(customerCreatedEvent);

    expect(spyEventHandler1).toHaveBeenCalled();
    expect(spyEventHandler2).toHaveBeenCalled();

    const customerAddressChanged = new CustomerAddressChangedEvent({
      id: "123",
      name: "Fulano",
      Address: {
        street: "American St",
        number: "456",
        zip: "25563-654",
        city: "California",
      }
    })

    eventDispatcher.notify(customerAddressChanged);
    expect(spyEventHandler).toHaveBeenCalled();
  });
});

import { CheckoutEvent } from "./config";

export const isValidCheckoutEventMessage = (event: MessageEvent): boolean => {
  return (
    Object.values(CheckoutEvent).includes(event.data) ||
    Object.values(CheckoutEvent).includes(event.data.type)
  );
};

// This is here to bridge a breaking change between the way checkout v1 and checkout v2 emit messages
// The new checkout emits an object with a type property, but the old checkout emits a string.
// This ensures both events become an object with a type property for the new checkout going forward
export const constructEventV2 = (event: MessageEvent) => {
  const newEvent = { data: event.data };

  if (typeof newEvent.data === "string") {
    newEvent.data = { type: newEvent.data };
  }

  return newEvent;
};

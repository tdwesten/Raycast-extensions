import { Action, ActionPanel, Color, Icon, List, getPreferenceValues, showToast, useNavigation } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { nanoid } from "nanoid";

type Room = {
  name: string;
  id: string;
  resourceEmail: string;
  available?: boolean;
  availability: string;
  availabilityMessage?: string;
  availabilityIcon?: string;
  events: Event[];
};

type Event = {
  summary: string;
  start: Date;
  end: Date;
};

// Component om de lijst van kamers weer te geven
export default function Command() {
  const { push } = useNavigation();
  const { username, password, url } = getPreferenceValues();

  if (!username || !password) {
    showToast({
      title: "Gebruikersnaam en wachtwoord zijn vereist",
      message: "Stel je gebruikersnaam en wachtwoord in om de kamers weer te geven",
    });
  }

  const { isLoading, data } = useFetch<{ isLoading: boolean; data: Room[]; revalidate: unknown }>(url, {
    headers: {
      Authorization: "Basic " + Buffer.from(username + ":" + password).toString("base64"),
    },
  });

  const roomData = data?.map((room: Room) => {
    room.id = nanoid();

    const now = new Date();
    const event = room.events.find((event) => event.start < now && event.end > now);
    room.availabilityMessage = event ? "In gebruik" : "Beschikbaar";
    room.availabilityIcon = event ? Icon.Dot : Icon.Dot;
    room.availability = event
      ? event.summary + " (" + event.start.toLocaleTimeString() + " -> " + event.end.toLocaleTimeString() + ")"
      : "Beschikbaar";

    room.available = event ? true : false;
    return room;
  });

  return (
    <List searchBarPlaceholder="Doorzoek de ruimtes..." isLoading={isLoading}>
      {roomData?.map((room: Room) => (
        <List.Item
          key={room.id}
          title={room.name}
          subtitle={room.availability}
          accessories={[
            {
              text: { value: room.availabilityMessage },
              icon: { tintColor: room.available ? Color.Red : Color.Green, source: room.availabilityIcon ?? Icon.Dot },
            },
          ]}
          actions={
            <ActionPanel>
              <Action title="Push" onAction={() => push(<RoomEventList events={room.events} />)} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function RoomEventList({ events }: { events: Event[] }) {
  return (
    <List>
      {events.length === 0 && (
        <List.EmptyView
          icon={{ source: "https://media1.tenor.com/m/A3uAfeQrWmMAAAAd/nothing-here-searching.gif" }}
          title="No events found"
        />
      )}

      {events.map((event) => (
        <List.Item
          key={event.summary}
          title={event.summary}
          subtitle={
            new Date(event.start).toDateString() +
            " " +
            new Date(event.start).toLocaleTimeString() +
            " -> " +
            new Date(event.end)?.toDateString() +
            " " +
            new Date(event.start).toLocaleTimeString()
          }
        />
      ))}
    </List>
  );
}

import { Action, ActionPanel, Icon, List, getPreferenceValues, useNavigation } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { Room } from "./room.dto";
import RoomEvent from "./room_event.dto";

interface FetchResponse {
  isLoading: boolean;
  data: Room[];
  revalidate: unknown;
}

// Component to display the list of rooms
export default function Command() {
  const { push } = useNavigation();
  const { username, password, url } = getPreferenceValues();

  const { isLoading, data } = useFetch<FetchResponse>(url, {
    headers: {
      Authorization: "Basic " + Buffer.from(username + ":" + password).toString("base64"),
    },
  });

  let roomData: Room[] | undefined;

  if (data === undefined && !isLoading) {
    return (
      <List>
        <List.EmptyView
          icon={{ source: "https://media1.tenor.com/m/4krG6BSnulUAAAAC/malfunction-system-malfunction.gif" }}
          title="API DOWN! CALL MILAN!"
        />
      </List>
    );
  }

  if (data && Array.isArray(data)) {
    roomData = data?.map((item) => {
      return Room.fromJSON(item);
    });
  }

  return (
    <List searchBarPlaceholder="Search for a room..." isLoading={isLoading}>
      {roomData?.map((room: Room) => (
        <List.Item
          key={room.id}
          title={room.name}
          icon={room.icon}
          subtitle={room.subTitle}
          accessories={[
            {
              text: { value: room.availabilityMessage },
            },
          ]}
          actions={
            <ActionPanel>
              <Action title="View Events" onAction={() => push(<RoomEventList events={room.events} />)} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function RoomEventList({ events }: { events: RoomEvent[] }) {
  return (
    <List searchBarPlaceholder="Search for a event">
      {events.length === 0 && (
        <List.EmptyView
          icon={{ source: "https://media1.tenor.com/m/A3uAfeQrWmMAAAAd/nothing-here-searching.gif" }}
          title="No events found"
        />
      )}

      {events.map((event: RoomEvent) => (
        <List.Item
          key={event.summary}
          title={event.summary}
          icon={Icon.Calendar}
          subtitle={event.subTitle}
          actions={
            <ActionPanel>{event.link && <Action.OpenInBrowser title="View Event" url={event.link} />}</ActionPanel>
          }
        />
      ))}
    </List>
  );
}

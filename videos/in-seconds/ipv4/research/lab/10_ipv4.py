from ipaddress import IPv4Address, IPv4Interface, IPv4Network
import socket
import sys

print(f"python={sys.version.split()[0]}")

source = IPv4Interface("192.168.1.10/24")
destination = IPv4Address("203.0.113.80")
gateway = IPv4Address("192.168.1.1")

source_bits = f"{int(source.ip):032b}"
print(f"source={source.ip}")
print(f"source_octets={list(source.ip.packed)}")
print(f"source_bits={source_bits}")
print(f"source_bit_length={len(source_bits)}")
print(f"ipv4_address_count={2 ** 32}")
assert len(source_bits) == 32
assert list(source.ip.packed) == [192, 168, 1, 10]
assert 2 ** 32 == 4294967296

source_network = source.network
destination_network = IPv4Network(f"{destination}/{source_network.prefixlen}", strict=False)
print(f"prefix_length={source_network.prefixlen}")
print(f"source_network={source_network}")
print(f"destination_network={destination_network}")
print(f"same_network={source_network == destination_network}")
print(f"gateway={gateway}")
print(f"gateway_in_source_network={gateway in source_network}")
assert str(source_network) == "192.168.1.0/24"
assert str(destination_network) == "203.0.113.0/24"
assert source_network != destination_network
assert gateway in source_network

routes = [
    (IPv4Network("0.0.0.0/0"), "198.51.100.1"),
    (IPv4Network("203.0.113.0/24"), "198.51.100.2"),
]
matches = [route for route in routes if destination in route[0]]
selected = max(matches, key=lambda route: route[0].prefixlen)
print(f"matching_routes={[(str(net), hop) for net, hop in matches]}")
print(f"longest_prefix_match={selected[0]} next_hop={selected[1]}")
assert selected[0] == IPv4Network("203.0.113.0/24")

private_networks = [
    IPv4Network("10.0.0.0/8"),
    IPv4Network("172.16.0.0/12"),
    IPv4Network("192.168.0.0/16"),
]
for network in private_networks:
    print(f"private_range={network} first={network.network_address} last={network.broadcast_address}")
assert source.ip in IPv4Network("192.168.0.0/16")
assert destination not in IPv4Network("192.168.0.0/16")

loopback = IPv4Network("127.0.0.0/8")
print(f"loopback_range={loopback} contains_127_0_0_1={IPv4Address('127.0.0.1') in loopback}")
assert IPv4Address("127.0.0.1") in loopback

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server:
    server.bind(("127.0.0.1", 0))
    server.listen(1)
    port = server.getsockname()[1]
    localhost = socket.getaddrinfo("localhost", port, socket.AF_INET, socket.SOCK_STREAM)
    addresses = sorted({item[4][0] for item in localhost})
    print(f"localhost_ipv4={addresses}")
    assert "127.0.0.1" in addresses

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as client:
        client.connect(("localhost", port))
        client.sendall(b"IPv4 loopback")
        connection, peer = server.accept()
        with connection:
            payload = connection.recv(1024)
        print(f"loopback_peer={peer[0]}")
        print(f"loopback_payload={payload.decode('ascii')}")
        assert peer[0] == "127.0.0.1"
        assert payload == b"IPv4 loopback"

print("all_assertions=passed")

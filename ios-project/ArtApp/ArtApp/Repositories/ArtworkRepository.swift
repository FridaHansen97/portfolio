import SwiftUI

@Observable
final class ArtworkRepository: ArtworkRepositoryProtocol {
    private let artworkService = ArtworkService()

    private(set) var artworks: [Artwork] = []

    func fetchArtworks(query: String) async throws {
        let response = try await artworkService.searchArtworks(query: query)
        artworks = response.data
    }
}

import SwiftUI

@Observable
final class ArtworkRepository: ArtworkRepositoryProtocol {
    private let artworkService: ArtworkService = ArtworkService()
    
    private(set) var artworks: [Artwork] = []
    private(set) var iiifBaseURL: String? = nil
    
    func fetchArtworks(query: String) async throws {
        let response = try await artworkService.searchArtworks(query: query)
        artworks = response.data
        iiifBaseURL = response.config.iiifUrl
    }
    
    func imageURL(for artwork: Artwork) -> URL? {
        guard let base = iiifBaseURL, let imageId = artwork.imageId else {
            return nil
        }
        return URL(string: "\(base)/\(imageId)/full/843,/0/default.jpg")
    }
}


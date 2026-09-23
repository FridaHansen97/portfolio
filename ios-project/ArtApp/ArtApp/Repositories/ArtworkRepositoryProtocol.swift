import Foundation

protocol ArtworkRepositoryProtocol: AnyObject {
    var artworks: [Artwork] {get}
    var iiifBaseURL: String? {get}
    
    func fetchArtworks(query: String) async throws
    func imageURL(for artwork: Artwork) -> URL?
}



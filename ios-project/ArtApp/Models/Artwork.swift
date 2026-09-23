import Foundation

struct ArtworkResponse: Decodable {
    let data: [Artwork]
    let config: ApiConfig
}

struct ApiConfig: Decodable {
    let iiifUrl: String
}

struct Artwork: Decodable, Identifiable, Hashable {
    let id: Int
    let title: String?
    let artistDisplay: String?
    let dateDisplay: String?
    let imageId: String?
    let thumbnail: Thumbnail?
}

struct Thumbnail: Decodable, Hashable {
    let altText: String?
    let width: Int?
    let heifht: Int?
}

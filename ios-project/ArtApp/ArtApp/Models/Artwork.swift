import Foundation

struct ArtworkResponse: Decodable {
    let data: [Artwork]
}

struct Artwork: Decodable, Identifiable, Hashable {
    let id: Int
    let title: String?
    let creationDate: String?
    let creators: [Creator]?
    let images: ArtworkImages?
    let technique: String?
    let description: String?
    let department: String?
}

struct Creator: Decodable, Hashable {
    let description: String?
}

struct ArtworkImages: Decodable, Hashable {
    let web: ImageAsset?
}

struct ImageAsset: Decodable, Hashable {
    let url: String
}

extension Artwork {
    var artistName: String {
        guard let description = creators?.first?.description else {
            return "Unknown artist"
        }
        return description.components(separatedBy: " (").first ?? description
    }

    var imageURL: URL? {
        guard let urlString = images?.web?.url else { return nil }
        return URL(string: urlString)
    }
}

// -- Sample data for previews

extension Artwork {
    static let sample = Artwork(
        id: 160729,
        title: "Baoyang Lake",
        creationDate: "1500s",
        creators: [Creator(description: "Song Xu (Chinese, 1525-c. 1606)")],
        images: ArtworkImages(web: ImageAsset(url: "https://openaccess-cdn.clevelandart.org/1998.78.14/1998.78.14_web.jpg")),
        technique: "album; ink and color on silk",
        description: "This album of landscape paintings depicts famous scenic areas around the city of Wuxing in southeastern China.",
        department: "Chinese Art"
    )

    static let empty = Artwork(
        id: 1,
        title: nil,
        creationDate: nil,
        creators: nil,
        images: nil,
        technique: nil,
        description: nil,
        department: nil
    )
}

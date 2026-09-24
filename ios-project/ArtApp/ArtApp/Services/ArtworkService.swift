import Foundation

struct ArtworkService {
    private let baseURL = "https://openaccess-api.clevelandart.org/api/artworks/"
    private let fields = "id,title,creation_date,creators,images"
    private let pageSize = 20

    func searchArtworks(query: String, page: Int = 1) async throws -> ArtworkResponse {
        guard var components = URLComponents(string: baseURL) else {
            throw URLError(.badURL)
        }

        var queryItems = [
            URLQueryItem(name: "fields", value: fields),
            URLQueryItem(name: "has_image", value: "1"),
            URLQueryItem(name: "cc0", value: nil),
            URLQueryItem(name: "limit", value: String(pageSize)),
            URLQueryItem(name: "skip", value: String((page - 1) * pageSize))
        ]
        if !query.isEmpty {
            queryItems.append(URLQueryItem(name: "q", value: query))
        }
        components.queryItems = queryItems

        guard let url = components.url else {
            throw URLError(.badURL)
        }

        let (data, response) = try await URLSession.shared.data(from: url)

        guard let httpResponse = response as? HTTPURLResponse,
              (200..<300).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return try decoder.decode(ArtworkResponse.self, from: data)
    }
}

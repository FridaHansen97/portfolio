import SwiftUI

struct RootView: View {
    var body: some View {
        Text("Testing API...")
            .task {
                do {
                    let response = try await ArtworkService().searchArtworks(query: "monet")
                    print("Got \(response.data.count) artworks")
                    print(response.data.first ?? "none")
                } catch {
                    print("Error: \(error)")
                }
            }
    }
}

#Preview {
    RootView()
}


import SwiftUI

struct ArtworkDetailView: View {
    let artwork: Artwork

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                AsyncImage(url: artwork.imageURL) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFit()
                    case .failure:
                        Image(systemName: "photo")
                            .frame(maxWidth: .infinity, minHeight: 200)
                    default:
                        ProgressView()
                            .frame(maxWidth: .infinity, minHeight: 200)
                    }
                }
                .accessibilityLabel(artwork.title ?? "Artwork")

                VStack(alignment: .leading, spacing: 4) {
                    Text(artwork.title ?? "Untitled")
                        .font(.title2)
                        .fontWeight(.bold)

                    Text(artwork.creators?.first?.description ?? "Unknown artist")
                        .foregroundStyle(.secondary)

                    if let date = artwork.creationDate {
                        Text(date)
                            .foregroundStyle(.secondary)
                    }
                }

                if let technique = artwork.technique {
                    Text(technique)
                        .font(.subheadline)
                        .italic()
                }

                if let description = artwork.description {
                    Text(description)
                }
            }
            .padding()
        }
        .navigationTitle(artwork.title ?? "Artwork")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    NavigationStack {
        ArtworkDetailView(artwork: .sample)
    }
}

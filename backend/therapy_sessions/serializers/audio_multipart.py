from rest_framework import serializers

class MultipartStartResponseSerializer(serializers.Serializer):
    uploadId = serializers.CharField() # ID for the multipart upload
    key = serializers.CharField() # S3 object key
    partSize = serializers.IntegerField() # size of each part in bytes

class MultipartPresignSerializer(serializers.Serializer):
    uploadId = serializers.CharField() # ID for the multipart upload
    partNumber = serializers.IntegerField(min_value=1, max_value=10000) # part number to be uploaded

class MultipartPresignResponseSeriializer(serializers.Serializer):
    url = serializers.URLField() # URL for uploading the part
    partNumber = serializers.IntegerField() # partNumber to match request

class MultipartCompleteSerializer(serializers.Serializer):
    uploadId = serializers.CharField()
    # parts: A list of dictionaries containing the PartNumber and the ETag
    # (a checksum/fingerprint) for every chunk uploaded.
    parts = serializers.ListField(child=serializers.DictField(), allow_empty=False)

    def validate_parts(self, parts):
        # Enforce required keys PartNumber + ETag
        # Ensures the frontend provided both the sequence number and the AWS-returned ETag 
        # for every chunk. AWS requires both to stitch the file together.
        for p in parts:
            if "PartNumber" not in p or "ETag" not in p:
                raise serializers.ValidationError("Each part must include PartNumber and ETag.")
        
        # Duplicate Check
        # Ensures the same part number wasn't sent twice. If set(nums) (which removes duplicates) is shorter than the original list, it means a number was repeated, which would corrupt the final file.        nums = [p["PartNumber"] for p in parts]
        nums = [p["PartNumber"] for p in parts]
        if len(nums) != len(set(nums)):
            raise serializers.ValidationError("Duplicate PartNumber detected.")
        return parts
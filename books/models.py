from django.db import models

# Create your models here.

class Book(models.Model):
    title = models.CharField(max_length=250)
    # author = models.CharField(max_length=250,null=True,blank=True)
    description = models.TextField()
    rating = models.FloatField(null=True, blank=True)
    url = models.URLField()
    img_url = models.URLField(null=True, blank=True)
    ai_summary = models.TextField(null=True, blank=True)
    genre = models.CharField(max_length=120, null=True, blank=True)

    def __str__(self):
        return self.title
